<template>
    <vl-interaction-select :filter="selectFilterFunc" :features.sync="selectedFeatures" ref="olSelectInteraction">
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
                selectedFeatures: []
            }
        },
        computed: {
            featureStyle() {
                if (!this.selectedFeature || this.selectedFeature == {})
                    return [0, 0, 0, 0];

                let terms = this.selectedFeature.properties.terms;
                let fillColor;
                if (terms.length > 1)
                    fillColor = [204, 204, 204, this.layerOpacity + 0.3];
                else if (terms.length == 0)
                    fillColor = [238, 238, 238, this.layerOpacity + 0.3];
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
                    return this.activeTool == 'Select'
                        && (feature.get('clusterSize') == 0 && ((terms.length == 0 && this.visibleNoTerm)
                        || (terms.length > 0 &&  this.visibleTerms.filter(t => -1 !== terms.indexOf(t)) > 0)))
                }
            },
        },
        watch: {
            selectedFeature(newValue) {
                if (!newValue)
                    this.selectedFeatures = [];
                else {
                    this.selectedFeatures = [newValue];
                }
            },
            selectedFeatures(newValue, oldValue) {
                if (newValue && newValue.length > 0 && newValue != oldValue) {
                    this.$emit('update:selectedFeature', newValue[0])
                }
                else {
                    this.$emit('update:selectedFeature', null);
                }
            },
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
            }
        },
        methods: {

        }
    }
</script>

<style scoped>

</style>
