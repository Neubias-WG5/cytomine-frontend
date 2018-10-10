<template>
    <span v-if="modifyToolActive">
        <vl-interaction-modify v-if="activeTool == 'Edit'"
                               ref="olModifyInteraction"
                               :source="'select-target'+viewerId"
                               @modifyend="edit">
        </vl-interaction-modify>
        <vl-interaction-translate v-if="activeTool == 'Drag'"
                                  :source="'select-target'+viewerId"
                                  @translateend="edit">
        </vl-interaction-translate>
        <vl-interaction-rotate v-if="activeTool == 'Rotate'"
                               :source="'select-target'+viewerId"
                               @rotateend="edit">
        </vl-interaction-rotate>
    </span>
</template>

<script>
    import parse from 'wellknown'
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
            'isReviewing',
            'viewerId'
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
            }
        },
        methods: {
            fill() {
                api.put(`/api/annotation/${this.selectedFeature.properties.id}.json?&fill=true`, {
                    fill: true,
                    id: this.selectedFeature.properties.id
                }).then(response => {
                    let annotation = response.data.data.annotation;
                    let user;
                    if (!annotation) {
                        annotation = response.data.data.reviewedannotation;
                        user = -100;
                    }
                    else
                        user = annotation.user;
                    let feature = this.selectedFeature;
                    feature.geometry = parse(annotation.location);
                    this.$emit('updateFeature', {
                        layerId: user,
                        featureId: annotation.id,
                        geometry: this.format.readGeometry(annotation.location)
                    });
                    this.$emit('update:selectedFeature', feature);
                    this.$emit('update:selectedAnnotation', annotation);
                    this.$emit('update:activeTool', 'Select');
                    this.$notify({
                        placement: 'bottom-right',
                        type: 'success',
                        content: response.data.data.message
                    });
                }).catch(error => {
                    this.$notify({
                        placement: 'bottom-right',
                        type: 'danger',
                        content: error.response.data.data.errors
                    });
                    this.$emit('update:activeTool', 'Select');
                });

            },
            edit(evt) {
                let annotation = this.selectedAnnotation;
                annotation.location = this.format.writeFeature(evt.features.getArray()[0]);
                api.put(`api/annotation/${annotation.id}.json`, annotation).then(response => {
                    let annotation = response.data.annotation;
                    if (!annotation)
                        annotation = response.data.reviewedannotation;
                    this.$emit('update:selectedAnnotation', annotation);
                    this.$notify({
                        placement: 'bottom-right',
                        type: 'success',
                        content: response.data.message
                    });
                }).catch(error => {
                    this.$notify({
                        placement: 'bottom-right',
                        type: 'danger',
                        content: error.response.data.errors
                    });
                    this.$emit('update:activeTool', 'Select');
                })
            },
            remove() {
                this.$confirm({
                    title: 'Confirm',
                    okType: 'danger',
                    okText: 'Delete',
                    content: `This annotation #${this.selectedFeature.properties.id} will be permanently deleted. Continue?`
                }).then(() => {
                    api.delete(`api/annotation/${this.selectedFeature.properties.id}.json`).then(response => {
                        this.$emit('updateAnnotationIndexes');
                        this.$emit('removeFeature', this.selectedFeature);
                        this.$emit('update:selectedFeature', null);
                        this.$emit('update:activeTool', 'Select');
                        this.$notify({
                            placement: 'bottom-right',
                            type: 'success',
                            content: response.data.message
                        });
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
