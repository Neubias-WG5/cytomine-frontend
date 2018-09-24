<template>
    <span v-if="drawToolActive">
        <vl-layer-vector>
            <vl-source-vector ident="draw-target" :features.sync="features" ref="olSourceVector" id="Drawable"></vl-source-vector>
        </vl-layer-vector>
        <vl-interaction-draw ref="olDrawInteraction" source="draw-target" :type="drawType"
                             :freehand="drawFreehand" :freehand-condition="undefined"
                             :geometry-function="drawGeometryFunc" @drawend="onDrawEnd">
        </vl-interaction-draw>
    </span>
</template>

<script>
    import Draw from 'ol/interaction/draw';
    import Polygon from 'ol/geom/polygon';
    import WKT from 'ol/format/wkt';
    import GeoJSON from 'ol/format/geojson';

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
            'selectedFeature'
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
                            let size = 300;
                            let originX = coord[0][0];
                            let originY = coord[0][1];
                            let newCoordinates = [
                                coord[0],
                                [originX - size / 2, originY - size / 2],
                                [originX - size / 4, originY - size / 2],
                                [originX - size / 4, originY - size * 2],
                                [originX + size / 4, originY - size * 2],
                                [originX + size / 4, originY - size / 2],
                                [originX + size / 2, originY - size / 2],
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

                this.$refs.olDrawInteraction.$createPromise.then(() => {
                    this.$refs.olDrawInteraction.recreate();
                });
            }
        },
        methods: {
            onDrawEnd(evt) {
                api.post(`/api/annotation.json`, this.drawableLayerIds.map(userId => { return {
                    location: this.format.writeFeature(evt.feature),
                    image: this.image.id,
                    roi: false,
                    term: this.associableTerms,
                    user: userId,
                }})).then(response => {
                    // this.notification("Annotation added", data.data.message, "success");
                    this.$emit('updateAnnotationIndexes');
                    //TODO: HORRIBLE HACK to get id//TODO: HORRIBLE HACK to get id
                    let annotationId = response.data.message.split(" ")[1].split(",")[0];
                    let feature = evt.feature;
                    let annotation = {
                        type: 'Feature',
                        id: feature.getId(),
                        geometry: new GeoJSON().writeFeature(feature),
                        properties: {
                            class: "be.cytomine.ontology.UserAnnotation",
                            id: annotationId,
                            terms: this.associableTerms,
                            user: this.currentUser.id,
                            clusterSize: 0
                        }
                    };
                    this.$emit('update:selectedFeature', annotation);
                    this.features = [];
                }).catch(error => {
                    // this.notification("Cannot add annotation", error.response.data.errors, "error");
                });
            }
        }

    }
</script>

<style scoped>

</style>
