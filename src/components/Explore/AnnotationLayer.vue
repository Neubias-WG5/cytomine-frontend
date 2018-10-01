<template>
    <vl-layer-vector ref="olLayerVector"
                     :visible="userLayer.visible && userLayer.selected"
                     :opacity.number="layerOpacity"
                     :id="'layer'+userLayer.id"
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
        ],
        computed: {
            styleFuncFactoryProp() {
                if (!this.userLayer.visible)
                    return function() { return (a,b) => {}};

                // Force computed property update.
                // See https://github.com/ghettovoice/vuelayers/issues/68#issuecomment-404223423
                let _ = this.visibleTerms;
                _ = this.visibleNoTerm;
                _ = this.rev;
                /////

                console.log("update");

                let func = function() {
                    const cache = {};
                    const strokeProperty = new Stroke({color: '#000000', width: 1.25});
                    return (feature, resolution) => {
                        if (feature.get('clusterSize') > 1) {
                            const size = feature.get('clusterSize');
                            let style = cache[size];

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
                                cache[size] = style
                            }
                            return [style]
                        }
                        else {
                            let terms = feature.get('terms');
                            let style;
                            if (terms.length > 1 && this.visibleTerms.filter(t => terms.includes(t)).length > 0)
                                style = this.styles[AnnotationStatus.MULTIPLE_TERMS];
                            else if (terms.length == 1 && this.visibleTerms.includes(terms[0]))
                                style = this.styles[terms[0]];
                            else if (terms.length == 0 && this.visibleNoTerm)
                                style = this.styles[AnnotationStatus.NO_TERM];
                            else
                                return [this.styles[AnnotationStatus.HIDDEN]];

                            if (!this.properties || this.properties == {})
                                return [style];
                            else {
                                style = clone(style);
                                let text = new Text({
                                    font: 'bold 36px sans-serif',
                                    fill: new Fill({
                                        color: this.selectedProperty.color,
                                    }),
                                    text: this.properties[feature.getId()],
                                    overflow: true,
                                    stroke: strokeProperty
                                });
                                style.setText(text);
                                return [style];
                            }
                        }
                    }
                };
                return func.bind(this);
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
                api.get(`api/annotation.json?user=${this.userLayer.id}&image=${this.image.id}&notReviewedOnly=${this.isReviewing}&showWKT=true&showTerm=true&kmeans=true&bbox=${this.extent.join(',')}`).then(response => {
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
                    this.loadProperties()
                })
            },
            loadProperties(incrementCounter = false) {
                if (this.selectedProperty.key == "") {
                    this.properties = {};
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
