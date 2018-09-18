<template>
    <vl-layer-vector :visible="userLayer.visible && userLayer.selected" :opacity="userLayer.opacity">
        <vl-source-vector :features.sync="features"></vl-source-vector>
    </vl-layer-vector>

</template>

<script>
    import { parse } from 'wellknown'
    import uniqby from 'lodash.uniqby'
    import uuid from 'uuid'

    export default {
        name: "AnnotationSourceVector",
        data() {
            return {
                features: [],
                localExtent: [0, 0, 0, 0]
            }
        },
        props: [
            'image',
            'userLayer',
            'visibleTerms',
            'visibleNoTerm',
            'annotationProperties',
            'isReviewing',
            'extent',
            'imageExtent'
        ],
        watch: {
            userLayer: {
                handler: function(newValue, oldValue) {
                    // If annotations have been deleted, reload all annotations
                    // if (newValue.size < oldValue.size) {
                    //     this.features = [];
                    //     this.loadAnnotations();
                    // }
                    // else
                    if ((newValue.visible && newValue.selected /*&& (!oldValue.visible || !oldValue.selected)*/)
                        || newValue.size != oldValue.size) {
                        this.loadAnnotations()
                    }
                },
                deep: true
            },
            extent(newValue) {
                this.computeLocalExtent(newValue)
            },
            localExtent() {
                if (this.userLayer.selected && this.userLayer.visible)
                    this.loadAnnotations();
            }
        },
        methods:{
            computeLocalExtent(newExtent) {
                if (newExtent[0] <= this.imageExtent[0] && this.imageExtent[2] <= newExtent[2] &&
                    newExtent[1] <= this.imageExtent[1] && this.imageExtent[3] <= newExtent[3]) {
                    this.localExtent = this.imageExtent
                }
                else {
                    this.localExtent = newExtent
                }
            },
            loadAnnotations() {
                api.get(`api/annotation.json?user=${this.userLayer.id}&image=${this.image.id}&notReviewedOnly=${this.isReviewing}&showWKT=true&showTerm=true&kmeans=true&bbox=${this.extent.join(',')}`).then(response => {
                    // Remove clusters
                    // let index = this.features.findIndex(feature => feature.properties.clusterSize > 1);
                    // while (index !== -1) {
                    //     this.features.splice(index, 1);
                    //     index = this.features.findIndex(feature => feature.properties.clusterSize > 1);
                    // }
                    // Add features if not existing
                    this.features = response.data.collection.map(annotation => {
                            return {
                                type: 'Feature',
                                id: annotation.count ? uuid() : annotation.id,
                                geometry: parse(annotation.location),
                                properties: {
                                    terms: annotation.term,
                                    user: this.userLayer.id,
                                    clusterSize: annotation.count ? annotation.count : 0
                                }
                            }
                    });
                    // this.features = uniqby(this.features.concat(newFeatures), 'id')
                })
            }
        },
        mounted() {
            this.computeLocalExtent(this.extent)
        }
    }
</script>

<style scoped>

</style>
