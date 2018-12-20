<template>
    <vl-layer-vector ref="olLayerVector"
                     :id="'layer'+userLayer.id+viewerId" :visible="visible" :z-index="zIndex"
                     @mounted="++revisionStyle">
        <vl-source-vector ref="olSourceVector"
                          :features.sync="features" :loader-factory="loader" :strategy-factory="strategy"
                          @mounted="++revisionStyle" >
        </vl-source-vector>
        <vl-style-func :factory="styleFuncFactoryProp" @mounted="++revisionStyle"></vl-style-func>
    </vl-layer-vector>

</template>

<script>
    import uuid from 'uuid'
    import { AnnotationStyleStatus } from '../../helpers/annotationStyleStatus'
    import WKT from 'ol/format/WKT';
    import { createStyle } from 'vuelayers/lib/ol-ext'
    import hexToRgb from "../../helpers/hexToRgb";

    export default {
        name: "AnnotationLayer",
        data() {
            return {
                format: new WKT(),
                features: [],
                properties: {},
                colorCodedProperties: {},
                revisionStyle: 0,
                revisionLoader: 0,

                resolution: null,
                clustered: false,
                maxResolutionNoClusters: null,
                minResolutionClusters: null
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
                let _ = this.revisionStyle;
                /////

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
                            styles.push(this.styles[AnnotationStyleStatus.CLUSTER]);
                            styles.push(styleText)
                        }
                        else {
                            if (this.colorCodedProperties && this.colorCodedProperties != {} && this.colorCodedProperties.hasOwnProperty(feature.getId())) {
                                let color = hexToRgb(this.colorCodedProperties[feature.getId()],this.layerOpacity);
                                styles.push(createStyle({
                                    strokeColor: color,
                                    strokeWidth: 2,
                                    fillColor: [238, 238, 238, this.layerOpacity],
                                    imageRadius: 7
                                }))
                            }
                            else {
                                let terms = feature.get('terms');
                                if (this.isReviewing && !this.userLayer.review) {
                                    if ((terms.length > 0 && this.visibleTerms.filter(t => terms.includes(t)).length > 0)
                                        || (terms.length == 0 && this.visibleNoTerm))
                                        styles.push(this.styles[AnnotationStyleStatus.NOT_REVIEWED]);
                                    else
                                        return [this.styles[AnnotationStyleStatus.HIDDEN]];
                                }
                                else {
                                    if (terms.length > 1 && this.visibleTerms.filter(t => terms.includes(t)).length > 0)
                                        styles.push(this.styles[AnnotationStyleStatus.MULTIPLE_TERMS]);
                                    else if (terms.length == 1 && this.visibleTerms.includes(terms[0]))
                                        styles.push(this.styles[terms[0]]);
                                    else if (terms.length == 0 && this.visibleNoTerm)
                                        styles.push(this.styles[AnnotationStyleStatus.NO_TERM]);
                                    else
                                        return [this.styles[AnnotationStyleStatus.HIDDEN]];

                                    if (this.userLayer.review)
                                        styles.push(this.styles[AnnotationStyleStatus.REVIEWED])
                                }
                            }

                            if (this.properties && this.properties != {} && this.properties.hasOwnProperty(feature.getId())) {
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
            },
            visible() {
                return this.userLayer.visible && this.userLayer.selected;
            }
        },
        watch: {
            selectedProperty() {
                this.loadProperties();
            },
            'image.id'() {
                ++this.revisionLoader;
            },
            isReviewing() {
                ++this.revisionLoader;
                ++this.revisionStyle;
            },
            'userLayer.clearAllRev'() {
                this.features = [];
                ++this.revisionLoader;
            },
            'userLayer.selected'(newValue, oldValue) {
                if (newValue && !oldValue)
                    ++this.revisionLoader;
            },
            visibleTerms() {
                ++this.revisionStyle;
            },
            visibleNoTerm() {
                ++this.revisionStyle;
            },
            layerOpacity() {
                ++this.revisionStyle;
            },
            revisionLoader() {
                this.loadColorCodedProperties();
                if (this.$refs.olSourceVector.$source)
                    this.$refs.olSourceVector.$source.clear();
            }
        },
        methods:{
            strategy() {
                let func = function(extent, resolution) {
                    let source = this.$refs.olSourceVector.$source;
                    if(this.resolution && this.clustered != null && // if some features have already been loaded
                        ((resolution != this.resolution && this.clustered) // zoom modification while clustering is performed
                            || (resolution > this.resolution && !this.clustered && resolution > this.maxResolutionNoClusters))) { // re-cluster
                        source.clear();
                    }

                    [0, 1].forEach(index => { if (extent[index] < 0) extent[index] = 0; });
                    [2, 3].forEach(index => { if (this.imageExtent[index] < extent[index]) extent[index] = this.imageExtent[index] });
                    return [extent];
                };
                return func.bind(this);
            },
            loader() {
                let func = function (extent, resolution, projection) {
                    let source = this.$refs.olSourceVector.$source;
                    this.resolution = resolution;
                    let bbox = (isFinite(extent[0])) ? extent.join() : [0, 0, this.image.width, this.image.height];
                    let user = (this.userLayer.id < 0) ? `reviewed=true` : `user=${this.userLayer.id}&notReviewedOnly=${this.isReviewing}`;
                    api.get(`api/annotation.json?${user}&image=${this.image.id}&showWKT=true&showTerm=true&kmeans=true&bbox=${bbox}`).then(response => {
                        let annotations = response.data.collection;
                        if (annotations.length == 0)
                            return;

                        if (annotations[0].count) {
                            this.clustered = true;
                            if (this.minResolutionClusters == null || resolution < this.minResolutionClusters) {
                                this.minResolutionClusters = resolution;
                            }
                        }
                        else {
                            this.clustered = false;
                            if (this.maxResolutionNoClusters == null || resolution > this.maxResolutionNoClusters) {
                                this.maxResolutionNoClusters = resolution;
                            }
                        }

                        source.addFeatures(this.createFeatures(annotations));
                    })
                };
                return func.bind(this);
            },
            createFeatures(annotations) {
                return annotations.map(annotation => this.createFeature(annotation))
            },
            createFeature(annotation) {
                let feature = this.format.readFeature(annotation.location);
                feature.setId(annotation.count ? uuid() : annotation.id);
                feature.set('class', annotation.class ? annotation.class : 'Cluster');
                feature.set('id', annotation.count ? uuid() : annotation.id);
                feature.set('terms', annotation.term ? annotation.term : []);
                feature.set('user', this.userLayer.id);
                feature.set('clusterSize', annotation.count ? annotation.count : 0);
                return feature;
            },
            addFeature(feature) {
                this.$refs.olSourceVector.addFeature(feature);
            },
            getFeatureById(id) {
                return this.$refs.olSourceVector.getFeatureById(id)
            },
            removeFeature(feature) {
                this.$refs.olSourceVector.removeFeature(feature);
            },
            loadProperties() {
                this.properties = {};
                if (this.selectedProperty.key == "") {
                    ++this.revisionStyle;
                }

                if (!this.selectedProperty.key || parseInt(this.userLayer.id) < 0)
                    return;

                api.get(`api/user/${this.userLayer.id}/imageinstance/${this.image.id}/annotationposition.json?key=${this.selectedProperty.key}`).then(response => {
                    response.data.collection.forEach(item => {
                        this.$set(this.properties, item.idAnnotation, item.value);
                        ++this.revisionStyle;
                    })
                });
            },
            loadColorCodedProperties() {
                this.colorCodedProperties = {};

                if (!this.userLayer.selected || parseInt(this.userLayer.id) < 0)
                    return;

                let key = "CUSTOM_ANNOTATION_DEFAULT_COLOR";
                api.get(`api/user/${this.userLayer.id}/imageinstance/${this.image.id}/annotationposition.json?key=${key}`).then(response => {
                    response.data.collection.forEach(item => {
                        this.$set(this.colorCodedProperties, item.idAnnotation, item.value);
                        ++this.revisionStyle;
                    })
                });
            }
        },
    }
</script>

<style scoped>

</style>
