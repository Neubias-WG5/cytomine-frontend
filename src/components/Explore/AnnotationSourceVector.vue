<template>
    <vl-layer-vector :visible="userLayer.visible && userLayer.selected" :opacity.number="layerOpacity">
        <vl-source-vector :features.sync="features"></vl-source-vector>
        <vl-style-func :factory="styleFuncFactoryProp"></vl-style-func>
    </vl-layer-vector>

</template>

<script>
    import { parse } from 'wellknown'
    import uniqby from 'lodash.uniqby'
    import uuid from 'uuid'
    import { createStyle } from 'vuelayers/lib/_esm/ol-ext'

    const AnnotationStatus = {
        NO_TERM: 'NO_TERM',
        MULTIPLE_TERMS: 'MULTIPLE_TERMS',
        CLUSTER: 'CLUSTER',
        REVIEW: 'REVIEW',
        HIDDEN: 'HIDDEN'
    };

    export default {
        name: "AnnotationSourceVector",
        data() {
            return {
                features: [],
                localExtent: [0, 0, 0, 0],
                styles: {}
            }
        },
        props: [
            'image',
            'userLayer',
            'terms',
            'visibleTerms',
            'visibleNoTerm',
            'annotationProperties',
            'isReviewing',
            'extent',
            'imageExtent',
            'layerOpacity'
        ],
        computed: {
            styleFuncFactoryProp() {
                // Kind of hack to force computed property update.
                // See https://github.com/ghettovoice/vuelayers/issues/68#issuecomment-404223423
                let _ = this.visibleTerms;
                _ = this.visibleNoTerm;
                let func = function() {
                    const clusterCache = {};
                    return (feature, resolution) => {
                        if (feature.get('clusterSize') > 1) {
                            const size = feature.get('clusterSize');
                            let style = clusterCache[size];

                            if (!style) {
                                style = createStyle({
                                    strokeColor: '#111111',
                                    strokeWidth: 1.25,
                                    strokeDash: [2, 2],
                                    fillColor: '#FFFFFF',
                                    text: size.toString(),
                                    textFillColor: '#3399CC',
                                    textFont: '36px Arial, sans-serif',
                                    textStrokeDash: [],
                                    // textBackgroundFillColor: '#FFFFFF',
                                });
                                clusterCache[size] = style
                            }
                            return [style]
                        }
                        else {
                            let terms = feature.get('terms');
                            if (terms.length > 1) // && intersect(this.visibleTerms, terms) > 0
                                return [this.styles[AnnotationStatus.MULTIPLE_TERMS]];
                            else if (terms.length == 1 && this.visibleTerms.includes(terms[0]))
                                return [this.styles[terms[0]]];
                            else if (terms.length == 0 && this.visibleNoTerm)
                                return [this.styles[AnnotationStatus.NO_TERM]];
                            else
                                return [this.styles[AnnotationStatus.HIDDEN]]
                        }
                    }
                };
                return func.bind(this);
            }
        },
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
                                    terms: annotation.term ? annotation.term : [],
                                    user: this.userLayer.id,
                                    clusterSize: annotation.count ? annotation.count : 0
                                }
                            }
                    });
                    // this.features = uniqby(this.features.concat(newFeatures), 'id')
                })
            },
            styleFuncFactory() {
                const clusterCache = {};

                return (feature, resolution) => {
                    if (feature.get('clusterSize') > 1) {
                        const size = feature.get('clusterSize');
                        let style = clusterCache[size];

                        if (!style) {
                            style = createStyle({
                                strokeColor: '#111111',
                                strokeWidth: 1.25,
                                strokeDash: [2, 2],
                                fillColor: '#FFFFFF',
                                text: size.toString(),
                                textFillColor: '#3399CC',
                                textFont: '36px Arial, sans-serif',
                                textStrokeDash: [],
                                // textBackgroundFillColor: '#FFFFFF',
                            });
                            clusterCache[size] = style
                        }

                        return [style]
                    }
                    else {
                        let terms = feature.get('terms');
                        if (terms.length > 1) // && intersect(this.visibleTerms, terms) > 0
                            return [this.styles[AnnotationStatus.MULTIPLE_TERMS]];
                        else if (terms.length == 1 && this.visibleTerms.includes(terms[0]))
                            return [this.styles[terms[0]]];
                        else if (terms.length == 0 && this.visibleNoTerm)
                            return [this.styles[AnnotationStatus.NO_TERM]];
                        else
                            return [this.styles[AnnotationStatus.HIDDEN]]
                    }
                }
            }
        },
        created() {
            let pointRadius = 7;
            this.styles[AnnotationStatus.NO_TERM] = createStyle({
                strokeColor: '#111111',
                strokeWidth: 2,
                fillColor: '#EEEEEE',
                imageRadius: pointRadius,
            });
            this.styles[AnnotationStatus.MULTIPLE_TERMS] = createStyle({
                strokeColor: '#111111',
                strokeWidth: 2,
                fillColor: '#CCCCCCC',
                imageRadius: pointRadius,
            });
            this.styles[AnnotationStatus.HIDDEN] = createStyle({
                strokeColor: 'rgba(0,0,0,0)',
                strokeWidth: 0,
                fillColor: 'rgba(0,0,0,0)'
            });

            this.terms.forEach(term => {
                this.styles[term.id] = createStyle({
                    strokeColor: '#111111',
                    strokeWidth: 2,
                    fillColor: term.color,
                    imageRadius: pointRadius,
                })
            })
        },
        mounted() {
            this.computeLocalExtent(this.extent)
        }
    }
</script>

<style scoped>

</style>
