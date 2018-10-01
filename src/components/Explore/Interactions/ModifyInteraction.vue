<template>
    <span v-if="modifyToolActive">
        <vl-interaction-modify v-if="activeTool == 'Edit'" ref="olModifyInteraction" source="select-target" @modifyend="edit">
        </vl-interaction-modify>
        <vl-interaction-translate v-if="activeTool == 'Drag'" source="select-target" @translateend="edit"></vl-interaction-translate>
        <vl-interaction-rotate v-if="activeTool == 'Rotate'" source="select-target" @rotateend="edit"></vl-interaction-rotate>
    </span>
</template>

<script>
    import parse from 'wellknown'
    import Draw from 'ol/interaction/draw';
    import Polygon from 'ol/geom/polygon';
    import WKT from 'ol/format/wkt';

    export default {
        name: "ModifyInteraction",
        data() {
            return {
                format: new WKT(),
            }
        },
        props: [
            'activeTool',
            'image',
            'currentUser',
            'selectedFeature',
            'selectedAnnotation',
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
                else if (this.activeTool == 'Edit') {
                    // this.$refs.olModifyInteraction.recreate();
                }
                else if (this.activeTool == 'Drag') {
                    // this.translate();
                }
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
                    let annotation = response.data.data.annotation;
                    let feature = this.selectedFeature;
                    feature.geometry = parse(annotation.location);
                    this.$emit('updateFeature', {
                        layerId: annotation.user,
                        featureId: annotation.id,
                        geometry: this.format.readGeometry(annotation.location)
                    });
                    this.$emit('update:selectedFeature', feature);
                    this.$emit('update:selectedAnnotation', annotation);
                    this.$emit('update:activeTool', 'Select');
                }).catch(error => {
                    // TODO: [NOTIFICATION]
                    this.$emit('update:activeTool', 'Select');
                });

            },
            edit(evt) {
                let annotation = this.selectedAnnotation;
                annotation.location = this.format.writeFeature(evt.features.getArray()[0]);
                api.put(`api/annotation/${annotation.id}.json`, annotation).then(response => {
                    //TODO: [NOTIFICATION]
                    this.$emit('update:selectedAnnotation', response.data.annotation);
                }).catch(error => {
                    //TODO: [NOTIFICATION]
                    this.$emit('update:activeTool', 'Select');
                })
            },
            remove() {
                this.$confirm({
                    title: 'Confirm',
                    okType: 'danger',
                    okText: 'Delete',
                    content: `This annotation #${this.selectedFeature.properties.id} will be permanently deleted. Continue?`
                })
                .then(() => {
                    api.delete(`api/annotation/${this.selectedFeature.properties.id}.json`).then(response => {
                        this.$notify({
                            placement: 'bottom-right',
                            type: 'success',
                            content: response.data.message
                        });
                        this.$emit('updateAnnotationIndexes');
                        this.$emit('update:selectedFeature', null);
                        this.$emit('update:activeTool', 'Select');
                    }).catch(error => {
                        this.$notify({
                            placement: 'bottom-right',
                            type: 'danger',
                            content: error.response.data.errors
                        });
                        this.$emit('update:activeTool', 'Select');
                    })
                })
                .catch(() => {
                    this.$notify({
                        placement: 'bottom-right',
                        content: 'Delete operation aborted.'
                    });
                    this.$emit('update:activeTool', 'Select');
                })
            }
        }
    }
</script>

<style scoped>

</style>
