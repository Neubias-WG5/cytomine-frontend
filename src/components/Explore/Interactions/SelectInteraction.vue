<template>
    <vl-interaction-select ident="select-target" :filter="selectFilterFunc" :features.sync="selectedFeatures" ref="olSelectInteraction">
        <template slot-scope="select">
            <vl-style-box>
                <vl-style-stroke :color="[17, 17, 17, 1]" :width="4"></vl-style-stroke>
                <vl-style-fill :color="featureStyle"></vl-style-fill>
                <vl-style-circle :radius="5">
                    <vl-style-stroke :color="[17, 17, 17, 1]" :width="4"></vl-style-stroke>
                    <vl-style-fill :color="featureStyle"></vl-style-fill>
                </vl-style-circle>
            </vl-style-box>
        </template>
    </vl-interaction-select>
</template>

<script>
    export default {
        name: "SelectInteraction",
        props: [
            'activeTool',
            'selectedFeature',
            'styles',
            'layerOpacity',
            'visibleTerms',
            'visibleNoTerm',
        ],
        data() {
            return {
            }
        },
        computed: {
            featureStyle() {
                if (!this.selectedFeature || this.selectedFeature == {})
                    return [0, 0, 0, 0];

                let terms = this.selectedFeature.properties.terms;
                let fillColor;
                if (terms.length > 1)
                    fillColor = [204, 204, 204, Math.min(this.layerOpacity + 0.3, 1.)];
                else if (terms.length == 0)
                    fillColor = [238, 238, 238, Math.min(this.layerOpacity + 0.3, 1.)];
                else {
                    fillColor = this.styles[terms[0]].getFill().getColor();
                    fillColor[3] = this.layerOpacity + 0.3;
                }
                return fillColor;
            },
            selectFilterFunc() {
                let _ = this.visibleTerms;
                _ = this.visibleNoTerm;
                _ = this.activeTool;
                return (feature, layer) => {
                    let terms = feature.get('terms');
                    return (this.activeTool == 'Select')
                        && (feature.get('clusterSize') == 0 && ((terms.length == 0 && this.visibleNoTerm)
                        || (terms.length > 0 &&   this.visibleTerms.filter(t => terms.includes(t)).length > 0)));
                }
            },
            selectedFeatures: {
                get: function() {
                    return (this.selectedFeature) ? [this.selectedFeature] : []
                },
                set: function(newValue) {
                    if (!newValue || newValue.length == 0)
                        this.$emit('update:selectedFeature', null);
                    else
                        this.$emit('update:selectedFeature', newValue[0]);
                }
            }
        },
        watch: {
            visibleTerms(newValue) {
                if (!this.selectedFeature || this.selectedFeature == {})
                    return;

                let terms = this.selectedFeature.properties.terms;
                if (newValue.filter(t => -1 !== terms.indexOf(t)) == 0)
                    this.$emit('update:selectedFeature', null)
            },
            visibleNoTerm(newValue) {
                if (!this.selectedFeature || this.selectedFeature == {})
                    return;

                if (this.selectedFeature.properties.terms.length == 0 && !newValue)
                    this.$emit('update:selectedFeature', null)
            },
            selectedFeature: {
                handler() {
                    this.refresh()
                },
                deep: true
            },
            layerOpacity() {
                this.refresh();
            }
        },
        methods: {
            refresh() {
                console.log("refres");
                this.$refs.olSelectInteraction.getFeatures().forEach(feature => feature.changed());
            }
        }
    }
</script>

<style scoped>

</style>
