<template>
    <!--<span v-if="modifyToolActive">-->
        <!--<vl-layer-vector id="Drawable">-->
            <!--<vl-source-vector ident="draw-target" :features.sync="features" ref="olSourceVectorDraw" ></vl-source-vector>-->
        <!--</vl-layer-vector>-->
        <!--<vl-interaction-draw ref="olDrawInteraction" source="draw-target" :type="drawType"-->
                             <!--:freehand="drawFreehand" :freehand-condition="undefined"-->
                             <!--:geometry-function="drawGeometryFunc" @drawend="onDrawEnd" @drawstart="onDrawStart">-->
        <!--</vl-interaction-draw>-->
    <!--</span>-->
</template>

<script>
    import Draw from 'ol/interaction/draw';
    import Polygon from 'ol/geom/polygon';
    import WKT from 'ol/format/wkt';

    export default {
        name: "ModifyInteraction",
        data() {
            return {
            }
        },
        props: [
            'activeTool',
            'image',
            'currentUser',
            'selectedFeature',
            'isReviewing'
        ],
        computed: {
            modifyToolActive() {
                return ['Fill', 'Edit', 'Drag', 'Resize', 'Rotate', 'Remove'].includes(this.activeTool)
            },

        },
        watch: {
            activeTool() {
                if (this.activeTool == 'Fill') {
                    this.fill()
                }
                else if (this.activeTool == 'Remove') {
                    this.remove()
                }
                // else if (this.activeTool == 'Edit') {
                //     this.$refs.olModifyInteraction.recreate();
                // }
                // else if (this.activeTool == 'Drag') {
                //     this.$refs.olTranslateInteraction.recreate();
                // }
                // else if (this.activeTool)
            }
        },
        methods: {
            fill() {
                api.put(`/api/annotation/${this.selectedFeature.properties.id}.json?&fill=true`, {
                    fill: true,
                    id: this.selectedFeature.properties.id
                }).then(response => {
                    // TODO: [NOTIFICATION]
                    this.$emit('updateAnnotationIndexes');
                    this.$emit('update:selectedFeature', null); // TODO: temporary, find better way to update selected geometry (force rerendering of select)
                    this.$emit('forceUpdateLayer', response.data.data.annotation.user);
                    this.$emit('selectFeature', {layerId: response.data.data.annotation.user, featureId: response.data.data.annotation.id});
                    this.$emit('update:activeTool', 'Select');
                }).catch(error => {
                    // TODO: [NOTIFICATION]
                    this.$emit('update:activeTool', 'Select');
                });

            },
            remove() {

            }
        }
    }
</script>

<style scoped>

</style>
