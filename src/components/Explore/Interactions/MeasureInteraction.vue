<template>
    <span>
        <vl-layer-vector>
            <vl-source-vector ident="draw-target" :features.sync="features" ref="olSourceVector"></vl-source-vector>
            <vl-style-box>
                <vl-style-stroke color="#ffcc33" :width="2"></vl-style-stroke>
                <vl-style-fill color="rgba(255, 255, 255, 0.2)"></vl-style-fill>
            </vl-style-box>
        </vl-layer-vector>

        <template v-if="measureToolActive">
            <vl-interaction-draw v-if="measureToolActive" source="draw-target" :type="drawType"
                                 @drawstart="onDrawStart" @drawend="onDrawEnd">
                <vl-style-box>
                    <vl-style-stroke color="rgba(0, 0, 0, 0.5)" :width="2" :line-dash="[10, 10]"></vl-style-stroke>
                    <vl-style-fill color="rgba(255, 255, 255, 0.2)"></vl-style-fill>
                </vl-style-box>
            </vl-interaction-draw>
        </template>

        <vl-overlay v-for="overlay in overlays" :key="overlay.id" :id="overlay.id" positioning="bottom-center"
                    :position="overlay.coords" :offset="[0, 0]" :auto-pan="true">
            <template slot-scope="scope">
                <div class="tooltip tooltip-static">
                    {{overlay.measure}}
                    <template v-if="overlay.type == 'LineString'">pixels</template>
                    <template v-else>pixels²</template>
                    <template v-if="overlay.measureMicroMeters">
                         (<template v-if="overlay.type == 'LineString'">
                            <template v-if="overlay.measureMicroMeters > 1000">{{Math.round(overlay.measureMicroMeters) / 1000}} mm</template>
                            <template v-else>{{overlay.measureMicroMeters}} µm</template>
                        </template>
                        <template v-else>
                            <template v-if="overlay.measureMicroMeters > 1000000">{{Math.round(overlay.measureMicroMeters / 1000) / 1000}} mm²</template>
                            <template v-else>{{overlay.measureMicroMeters}} µm²</template>
                        </template>)
                    </template>
                    <button class="btn btn-default btn-xs" @click="removeFeature(overlay.id)"><i class="fas fa-times"></i></button>
                </div>
            </template>
        </vl-overlay>
    </span>
</template>

<script>
    export default {
        name: "MeasureInteraction",
        data() {
            return {
                currentSketch: null,
                overlays: [],
                features: [],
            }
        },
        props: [
            'image',
            'activeTool'
        ],
        computed: {
            measureToolActive() {
                return this.activeTool == 'Ruler' || this.activeTool == 'Area'
            },
            drawType() {
                return (this.activeTool == 'Ruler') ? 'LineString' : 'Polygon'
            }
        },
        watch: {
            image(newValue, oldValue) {
                if (oldValue.id != newValue.id) {
                    this.features = [];
                    this.overlays = [];
                }
            }
        },
        methods: {
            onDrawStart(evt) {
                this.currentSketch = evt.feature;
            },
            onDrawEnd() {
                let coords, measure;
                let id = this.currentSketch.getId();
                let geometry = this.currentSketch.getGeometry();
                if (geometry.getType() == 'Polygon') {
                    coords = geometry.getInteriorPoint().getCoordinates().slice(0, 2);
                    measure = geometry.getArea();
                }
                else {
                    coords = geometry.getLastCoordinate();
                    measure = geometry.getLength();
                }
                this.currentSketch = null;
                this.overlays.push({
                    id: id,
                    type: geometry.getType(),
                    coords: coords,
                    measure: Math.round(measure * 1000) / 1000,
                    measureMicroMeters: this.measureInMicroMeters(measure, geometry.getType() == 'Polygon')
                });
            },
            measureInMicroMeters(measure, isArea) {
                if (!this.image.resolution)
                    return null;

                if (isArea)
                    return Math.round(measure * this.image.resolution * this.image.resolution * 1000) / 1000;
                else
                    return Math.round(measure * this.image.resolution * 1000) / 1000;
            },
            removeFeature(id) {
                this.$refs.olSourceVector.$createPromise.then(() => {
                    let feature = this.$refs.olSourceVector.$source.getFeatureById(id);
                    this.$refs.olSourceVector.$source.removeFeature(feature);
                });
                let index = this.overlays.findIndex(feature => feature.id == id);
                this.overlays.splice(index, 1);
            }
        }
    }
</script>

<style scoped>
    .tooltip {
        position: relative;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 4px;
        color: white;
        padding: 4px 8px;
        opacity: 0.7;
        white-space: nowrap;
    }
    .tooltip-static {
        background-color: #ffcc33;
        color: black;
        border: 1px solid white;
    }
    .tooltip-static:before {
        border-top: 6px solid rgba(0, 0, 0, 0.5);
        border-right: 6px solid transparent;
        border-left: 6px solid transparent;
        content: "";
        position: absolute;
        bottom: -6px;
        margin-left: -7px;
        left: 50%;
    }
    .tooltip-static:before {
        border-top-color: #ffcc33;
    }
</style>
