<template>
    <vl-interaction-select :ident="'select-target'+viewerId" :filter="selectFilterFunc" :features.sync="selectedFeatures" ref="olSelectInteraction">
        <template slot-scope="select">
            <vl-style-box :z-index="30">
                <vl-style-stroke v-bind="strokeStyle"></vl-style-stroke>
                <vl-style-fill :color="fillStyle"></vl-style-fill>
                <vl-style-circle :radius="pointRadius">
                    <vl-style-stroke v-bind="strokeStyle"></vl-style-stroke>
                    <vl-style-fill :color="fillStyle"></vl-style-fill>
                </vl-style-circle>
            </vl-style-box>
        </template>
    </vl-interaction-select>
</template>

<script>
    import clone from "lodash.clone"

    export default {
        name: "SelectInteraction",
        props: [
            'activeTool',
            'selectedFeature',
            'styles',
            'layerOpacity',
            'visibleTerms',
            'visibleNoTerm',
            'isReviewing',
            'pointRadius',
            'viewerId'
        ],
        data() {
            return {
            }
        },
        computed: {
            strokeStyle() {
                if (!this.selectedFeature || this.selectedFeature == {})
                    return {color: [0,0,0,0], width:0 };

                if (this.isReviewing) {
                    if (!this.selectedFeature.properties.class.includes("Reviewed"))
                        return {color: [255, 0, 0, 1], width: 5};
                    else
                        return {color: [80, 204, 102, 1], width: 5};
                }
                else {
                    return {color: [17, 17, 17, 1], width: 4}
                }
            },
            fillStyle() {
                if (!this.selectedFeature || this.selectedFeature == {})
                    return [0, 0, 0, 0];

                let terms = this.selectedFeature.properties.terms;
                let fillColor;
                if (this.isReviewing && !this.selectedFeature.properties.class.includes("Reviewed")) {
                    fillColor = [189, 54, 47, Math.min(this.layerOpacity + 0.3, 1.)]
                }
                else {
                    if (terms.length > 1)
                        fillColor = [204, 204, 204, Math.min(this.layerOpacity + 0.3, 1.)];
                    else if (terms.length == 0)
                        fillColor = [238, 238, 238, Math.min(this.layerOpacity + 0.3, 1.)];
                    else {
                        fillColor = clone(this.styles[terms[0]].getFill().getColor());
                        fillColor[3] = this.layerOpacity + 0.3;
                    }
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
