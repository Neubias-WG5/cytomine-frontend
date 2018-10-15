<template>
    <span v-if="drawToolActive">
        <vl-layer-vector :id="'Drawable'+viewerId">
            <vl-source-vector :ident="'draw-target'+viewerId" :features.sync="features" ref="olSourceVectorDraw" ></vl-source-vector>
        </vl-layer-vector>
        <vl-interaction-draw ref="olDrawInteraction" :source="'draw-target'+viewerId" :type="drawType"
                             :freehand="drawFreehand" :freehand-condition="undefined"
                             :geometry-function="drawGeometryFunc" @drawend="onDrawEnd" @drawstart="onDrawStart">
        </vl-interaction-draw>
    </span>
</template>

<script>
    import { createBox, createRegularPolygon } from 'ol/interaction/Draw';
    import Polygon from 'ol/geom/Polygon';
    import WKT from 'ol/format/WKT';
    import Feature from 'ol/Feature';

    export default {
        name: "DrawInteraction",
        data() {
            return {
                features: [],
                format: new WKT(),
            }
        },
        props: [
            'activeTool',
            'userLayers',
            'associableTerms',
            'drawableLayerIds',
            'image',
            'currentUser',
            'selectedFeature',
            'isReviewing',
            'viewerId'
        ],
        computed: {
            drawToolActive() {
                return ['Point', 'Line', 'Arrow', 'Rectangle', 'Ellipse', 'Circle', 'Polygon',
                    'Freehand', 'Union', 'Difference'].includes(this.activeTool)
            },
            drawType() {
                switch(this.activeTool) {
                    case 'Point':
                        return 'Point';
                    case 'Line':
                        return 'LineString';
                    case 'Arrow':
                    case 'Rectangle':
                    case 'Ellipse':
                    case 'Circle':
                        return 'Circle';
                    case 'Polygon':
                    case 'Freehand':
                    case 'Union':
                    case 'Difference':
                        return 'Polygon';
                }
            },
            drawFreehand() {
                return ['Freehand', 'Union', 'Difference'].includes(this.activeTool)
            },
            drawGeometryFunc() {
                let _ = this.activeTool;
                switch(this.activeTool) {
                    case 'Rectangle':
                        return createBox();
                    case 'Arrow':
                        return function (coord, geometry) {
                            if (!geometry) {
                                geometry = new Polygon(null);
                            }
                            let originX = coord[0][0],
                                originY = coord[0][1],
                                mouseX = coord[1][0],
                                mouseY = coord[1][1],
                                deltaX = mouseX - originX,
                                deltaY = mouseY - originY;
                            let newCoordinates = [
                                coord[0],
                                [originX - deltaX / 2, originY - deltaY / 2],
                                [originX - deltaX / 4, originY - deltaY / 2],
                                [originX - deltaX / 4, originY - deltaY * 2],
                                [originX + deltaX / 4, originY - deltaY * 2],
                                [originX + deltaX / 4, originY - deltaY / 2],
                                [originX + deltaX / 2, originY - deltaY / 2],
                                coord[0],
                            ];
                            geometry.setCoordinates([newCoordinates]);
                            return geometry;
                        };
                    case 'Ellipse':
                        return function (coord, geometry) {
                            if (!geometry) {
                                geometry = new Polygon(null);
                            }
                            let originX = coord[0][0],
                                originY = coord[0][1],
                                mouseX = coord[1][0],
                                mouseY = coord[1][1],
                                newCoordinates = [],
                                deltaX = mouseX - originX,
                                deltaY = mouseY - originY,
                                centerX = originX + deltaX / 2,
                                centerY = originY + deltaY / 2;

                            for (let i = 0; i < 2 * Math.PI; i += 2 * Math.PI / 15) {
                                let xPos = centerX + (deltaX / 2 * Math.sin(i)) + (deltaY / 2 * Math.cos(i));
                                let yPos = centerY + (deltaX / 2 * Math.cos(i)) + (deltaY / 2 * Math.sin(i));

                                newCoordinates.push([xPos, yPos]);
                            }

                            // Last coordinate must be identical to first one.
                            newCoordinates.pop();
                            newCoordinates.push(newCoordinates[0]);

                            geometry.setCoordinates([newCoordinates]);
                            return geometry;
                        };
                    case 'Circle':
                        return createRegularPolygon();
                    default:
                        return undefined;
                }
            }
        },
        watch: {
            activeTool() {
                if (!this.$refs.olDrawInteraction || !this.drawToolActive)
                    return;

                this.$refs.olDrawInteraction.recreate();
            }
        },
        methods: {
            createFeature(annotation) {
                let feature = this.format.readFeature(annotation.location);
                feature.setId(annotation.count ? uuid() : annotation.id);
                feature.set('class', annotation.class ? annotation.class : 'Cluster');
                feature.set('id', annotation.count ? uuid() : annotation.id);
                feature.set('terms', annotation.term ? annotation.term : []);
                feature.set('user', annotation.user);
                feature.set('clusterSize', annotation.count ? annotation.count : 0);
                return feature;
            },
            clean() {
                this.features.splice(0, this.features.length);
                this.$refs.olSourceVectorDraw.clear(true);
                this.$refs.olDrawInteraction.recreate();
            },
            onDrawStart(evt) {
                this.features = [];

                if (['Union', 'Difference'].includes(this.activeTool)) {
                    this.$emit('update:selectedFeature', null)
                }
            },
            onDrawEnd(evt) {
                switch(this.activeTool) {
                    case 'Union':
                    case 'Difference':
                        api.post(`/api/annotationcorrection.json`, {
                            image: this.image.id,
                            layers: this.drawableLayerIds,
                            location: this.format.writeFeature(evt.feature),
                            remove: this.activeTool == 'Difference',
                            review: this.isReviewing
                        }).then(response => {
                            let annotation = response.data.annotation;
                            let user;
                            if (!annotation) {
                                annotation = response.data.reviewedannotation;
                                user = -100;
                            }
                            else
                                user = annotation.user;

                            // Union can merge several annotations into a single one
                            // 1) annotation layer index can decrease
                            // 2) Refresh all features from layer as we don't know which annotations have been merged.
                            this.$emit('updateAnnotationIndexes');
                            this.$emit('forceUpdateLayer', user);
                            this.$emit('selectFeature', {layerId: user, featureId: annotation.id});
                            this.clean();
                            this.$notify({
                                placement: 'bottom-right',
                                type: 'success',
                                content: response.data.message
                            });
                        }).catch(error => {
                            this.clean();
                            this.$notify({
                                placement: 'bottom-right',
                                type: 'danger',
                                content: error.response.data.errors
                            });
                        });
                        break;
                    default:
                        // Should send all annotations from "multi-draw" in one request.
                        // But backend response contains no UI message and no created object(s).
                        // For now, send one request by drawable layer....
                        let currentUserDrawable = this.drawableLayerIds.includes(this.currentUser.id);
                        this.drawableLayerIds.map((userId, index) => {
                            api.post(`/api/annotation.json`, {
                                location: this.format.writeFeature(evt.feature),
                                image: this.image.id,
                                roi: false,
                                term: this.associableTerms,
                                user: userId,
                            }).then(response => {
                                let annotation = response.data.annotation;
                                annotation.term = this.associableTerms; // Backend does not send term in response...
                                this.$emit('updateAnnotationIndexes');
                                this.$emit('addFeature', this.createFeature(annotation));
                                if ((currentUserDrawable && userId == this.currentUser.id)
                                    || (!currentUserDrawable && index == 0)) {
                                    this.$emit('selectFeature', {layerId: userId, featureId: annotation.id});
                                }
                                this.clean();
                                this.$notify({
                                    placement: 'bottom-right',
                                    type: 'success',
                                    content: response.data.message
                                });
                            }).catch(error => {
                                this.clean();
                                this.$notify({
                                    placement: 'bottom-right',
                                    type: 'danger',
                                    content: error.response.data.errors
                                });
                            });
                        })
                }
            }
        }
    }
</script>

<style scoped>

</style>
