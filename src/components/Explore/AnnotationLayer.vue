<template>
    <vl-layer-vector ref="olLayerVector"
                     :visible="userLayer.visible && userLayer.selected"
                     :id="'layer'+userLayer.id+viewerId" :z-index="zIndex"
                     @mounted="rev++">
        <vl-source-vector ref="olSourceVector" :features.sync="features" @mounted="rev++"></vl-source-vector>
        <vl-style-func :factory="styleFuncFactoryProp" @mounted="rev++"></vl-style-func>
    </vl-layer-vector>

</template>

<script>
    import uuid from 'uuid'
    import parse from 'wellknown'
    import clone from 'lodash.clone'
    import AnnotationStatus from '../../helpers/annotationStatus'

    import Text from 'ol/style/text';
    import Fill from 'ol/style/fill';
    import Stroke from 'ol/style/stroke';
    import { createStyle } from 'vuelayers/lib/_esm/ol-ext'

    export default {
        name: "AnnotationLayer",
        data() {
            return {
                features: [],
                properties: {},
                localExtent: [0, 0, 0, 0],

                clearAllRev: 0,
                rev: 0
            }
        },
        props: [
            'image',
            'userLayer',
            'terms',
            'visibleTerms',
            'visibleNoTerm',
            'selectedProperty',
            'isReviewing',
            'extent',
            'imageExtent',
            'layerOpacity',
            'styles',
            'viewerId'
        ],
        computed: {
            styleFuncFactoryProp() {
                if (!this.userLayer.visible)
                    return function() { return (a,b) => {}};

                // Force computed property update.
                // See https://github.com/ghettovoice/vuelayers/issues/68#issuecomment-404223423
                let _ = this.visibleTerms;
                _ = this.visibleNoTerm;
                _ = this.layerOpacity;
                _ = this.isReviewing;
                _ = this.rev;
                /////

                console.log("update");

                let func = function() {
                    const cache = {};
                    return (feature, resolution) => {
                        let styles = [];

                        if (feature.get('clusterSize') > 1) {
                            const size = feature.get('clusterSize');
                            let styleText = cache[size];

                            if (!styleText) {
                                styleText = createStyle({
                                    text: size.toString(),
                                    textStrokeColor: 'black',
                                    textStrokeWidth: 1.25,
                                    textFillColor: 'white',
                                    textFont: '24px Arial, sans-serif',
                                });
                                cache[size] = styleText
                            }
                            styles.push(this.styles[AnnotationStatus.CLUSTER]);
                            styles.push(styleText)
                        }
                        else {
                            let terms = feature.get('terms');
                            if (this.isReviewing && !this.userLayer.review) {
                                if ((terms.length > 0 && this.visibleTerms.filter(t => terms.includes(t)).length > 0)
                                    || (terms.length == 0 && this.visibleNoTerm))
                                    styles.push(this.styles[AnnotationStatus.NOT_REVIEWED]);
                                else
                                    return [this.styles[AnnotationStatus.HIDDEN]];
                            }
                            else {
                                if (terms.length > 1 && this.visibleTerms.filter(t => terms.includes(t)).length > 0)
                                    styles.push(this.styles[AnnotationStatus.MULTIPLE_TERMS]);
                                else if (terms.length == 1 && this.visibleTerms.includes(terms[0]))
                                    styles.push(this.styles[terms[0]]);
                                else if (terms.length == 0 && this.visibleNoTerm)
                                    styles.push(this.styles[AnnotationStatus.NO_TERM]);
                                else
                                    return [this.styles[AnnotationStatus.HIDDEN]];

                                if (this.userLayer.review)
                                    styles.push(this.styles[AnnotationStatus.REVIEWED])
                            }

                            if (this.properties && this.properties != {}) {
                                styles.push(createStyle({
                                    text: this.properties[feature.getId()],
                                    textFillColor: this.selectedProperty.color,
                                    textFont: '36px Arial, sans-serif',
                                    textOverflow: true,
                                    textStrokeColor: '#000000',
                                    textStrokeWidth: 1
                                }));
                            }
                        }
                        return styles;
                    }
                };
                return func.bind(this);
            },
            zIndex() {
                return (this.userLayer.id < 0) ? 20 : 10;
            }
        },
        watch: {
            userLayer: {
                handler: function(newValue, oldValue) {
                    if (newValue.clearAllRev > this.clearAllRev) {
                        this.clearAllRev = newValue.clearAllRev;
                        this.features = [];
                        this.loadAnnotations();
                    }
                    else if ((newValue.visible && newValue.selected /*&& (!oldValue.visible || !oldValue.selected)*/)
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
            },
            selectedProperty() {
                this.loadProperties(true);
            },
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
                let user;
                if (this.userLayer.id < 0) {
                    user = `reviewed=true`
                }
                else {
                    user = `user=${this.userLayer.id}&notReviewedOnly=${this.isReviewing}`
                }
                api.get(`api/annotation.json?${user}&image=${this.image.id}&showWKT=true&showTerm=true&kmeans=true&bbox=${this.extent.join(',')}`).then(response => {
                    this.features = response.data.collection.map(annotation => {
                            return {
                                type: 'Feature',
                                id: annotation.count ? uuid() : annotation.id,
                                geometry: parse(annotation.location),
                                properties: {
                                    class: annotation.class ? annotation.class : 'Cluster',
                                    id: annotation.count ? uuid() : annotation.id,
                                    terms: annotation.term ? annotation.term : [],
                                    user: this.userLayer.id,
                                    clusterSize: annotation.count ? annotation.count : 0
                                }
                            }
                    });
                    this.loadProperties(true)
                })
            },
            loadProperties(incrementCounter = false) {
                this.properties = {};
                if (this.selectedProperty.key == "") {
                    if (incrementCounter)
                        ++this.rev;
                }

                if (!this.selectedProperty.key || parseInt(this.userLayer.id) < 0)
                    return;

                api.get(`api/user/${this.userLayer.id}/imageinstance/${this.image.id}/annotationposition.json?key=${this.selectedProperty.key}`).then(response => {
                    response.data.collection.forEach(item => {
                        this.$set(this.properties, item.idAnnotation, item.value);
                        if (incrementCounter)
                           ++this.rev;
                    })
                });
            },
        },
        mounted() {
            this.computeLocalExtent(this.extent);
            this.rev++;
        }
    }
</script>

<style scoped>

</style>
