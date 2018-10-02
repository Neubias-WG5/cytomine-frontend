<template>
    <span v-if="drawToolActive">
        <vl-layer-vector id="Drawable">
            <vl-source-vector ident="draw-target" :features.sync="features" ref="olSourceVectorDraw" ></vl-source-vector>
        </vl-layer-vector>
        <vl-interaction-draw ref="olDrawInteraction" source="draw-target" :type="drawType"
                             :freehand="drawFreehand" :freehand-condition="undefined"
                             :geometry-function="drawGeometryFunc" @drawend="onDrawEnd" @drawstart="onDrawStart">
        </vl-interaction-draw>
    </span>
</template>

<script>
    import Draw from 'ol/interaction/draw';
    import Polygon from 'ol/geom/polygon';
    import WKT from 'ol/format/wkt';

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
            'isReviewing'
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
                console.log("change");
                switch(this.activeTool) {
                    case 'Rectangle':
                        return Draw.createBox();
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
                        return Draw.createRegularPolygon();
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
            onDrawStart(evt) {
                this.features = []
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
                            // TODO: [NOTIFICATION]

                            // Union can merge several annotations into a single one
                            // 1) annotation layer index can decrease
                            // 2) Refresh all features from layer as we don't know which annotations have been merged.
                            this.$emit('updateAnnotationIndexes');
                            this.$emit('forceUpdateLayer', user);
                            this.$emit('selectFeature', {layerId: user, featureId: annotation.id});
                            this.features.splice(0, this.features.length);
                            this.$refs.olSourceVectorDraw.clear();
                            this.$refs.olDrawInteraction.recreate();
                        }).catch(error => {
                            // TODO: [NOTIFICATION]
                            this.features.splice(0, this.features.length);
                            this.$refs.olSourceVectorDraw.clear();
                            this.$refs.olDrawInteraction.recreate();
                        });
                        break;
                    default:
                        api.post(`/api/annotation.json`, this.drawableLayerIds.map(userId => { return {
                            location: this.format.writeFeature(evt.feature),
                            image: this.image.id,
                            roi: false,
                            term: this.associableTerms,
                            user: userId,
                        }})).then(response => {
                            // TODO: [NOTIFICATION] this.notification("Annotation added", data.data.message, "success");
                            let annotationId = response.data.message.split(" ")[1].split(",")[0]; // HORRIBLE HACK to get id
                            this.$emit('updateAnnotationIndexes');
                            this.$emit('selectFeature', {layerId: this.currentUser.id, featureId: annotationId});
                            this.features.splice(0, this.features.length);
                            this.$refs.olSourceVectorDraw.clear();
                            this.$refs.olDrawInteraction.recreate();
                        }).catch(error => {
                            // TODO: [NOTIFICATION] this.notification("Cannot add annotation", error.response.data.errors, "error");
                            this.features.splice(0, this.features.length);
                            this.$refs.olSourceVectorDraw.clear();
                            this.$refs.olDrawInteraction.recreate();
                        });
                }
            }
        }

    }
</script>

<style scoped>

</style>
