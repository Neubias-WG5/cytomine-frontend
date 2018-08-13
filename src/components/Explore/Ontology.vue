<template>
    <section>
        <h4>Ontology</h4>

        <ontology-tree :ontology="ontology" :editable="false" :visible-terms="visibleTerms"
                       :associated-terms="associableTerms" :size-terms="sizeTerms" @showAllTerms="showAllTerms"
                       @toggleAssociateTerm="toggleAssociateTerm" @toggleVisibilityTerm="toggleVisibilityTerm">
        </ontology-tree>

        <div class="checkbox">
            <label>
                <input v-model="visibleNoTerm" type="checkbox" name="showNoTermAnnotation" id="showNoTermAnnotation">
                <label for="showNoTermAnnotation">Show annotations without terms</label>
            </label>
        </div>
        <!--<ul class="list-group mt-4">-->
            <!--<li class="list-group-item" v-for="term in terms" :key="'term-'+term.id">-->
                <!--<span class="glyphicon glyphicon-stop" :style="`color: ${term.color};`"></span>-->
                <!--<input @change="handlePost(term.id)" v-model="featureTerms" :value="term.id" type="checkbox"-->
                       <!--:name="'term-'+term.id" :id="'term-'+term.id">-->
                <!--<label :for="'term-'+term.id">{{term.key}} ({{term.value}})</label>-->
                <!--<label :for="'show-term-'+term.id">Show</label>-->
                <!--<input v-model="visibleTerms" :value="term.id" type="checkbox" :id="'show-term-'+term.id">-->
            <!--</li>-->
        <!--</ul>-->

        <!--<div class="btn-group">-->
            <!--<button class="btn btn-default" @click="showAllTerms">Show all</button>-->
            <!--<button class="btn btn-default" @click="hideAllTerms">Hide all</button>-->
        <!--</div>-->
    </section>
</template>

<script>
    import intersection from 'lodash.intersection'
    import Style from 'ol/style/style';
    import Fill from 'ol/style/fill';
    import Stroke from 'ol/style/stroke';
    import hexToRgb from '../../helpers/hexToRgb'
    import OntologyTree from "../Ontology/OntologyTree";

    export default {
        name: 'Ontology',
        components: {OntologyTree},
        props: [
            'project',
            'ontology',
            'visibleTerms',
            'associableTerms',
            'sizeTerms',
            'visibleNoTerm'
        ],
        data() {
            return {
                // terms: [],
                // visibleTerms: [],
                // showWithNoTerm: true,
                // featureTerms: [],
            }
        },
        computed: {
            // termsId() {
            //     return this.terms.map(term => term.id);
            // },
            // featureSelectedDataToShow() {
            //     if (this.featureSelected !== undefined && this.featureSelected.hasOwnProperty('id_')) {
            //         return this.featureSelectedData;
            //     } else {
            //         return undefined;
            //     }
            // }
        },
        watch: {
            // visibleTerms(newValue) {
            //     this.$emit('showTerms', newValue);
            // },
            // showWithNoTerm(newValue) {
            //     this.$emit('showWithNoTerm', newValue);
            // },
            // featureSelectedDataToShow(newValue) {
            //     if (newValue === undefined) {
            //         this.featureTerms = [];
            //     } else {
            //         this.featureTerms = newValue.term;
            //     }
            // }
        },
        methods: {
            toggleAssociateTerm(termId) {
                this.$emit('toggleAssociateTerm', termId);
            },
            toggleVisibilityTerm(termId) {
                this.$emit('toggleVisibilityTerm', termId);
            },
            showAllTerms(bool) {
                this.$emit('showAllTerms', bool);
            }
            // showAllTerms() {
            //     this.visibleTerms = this.termsId;
            //     this.showWithNoTerm = true;
            // },
            // hideAllTerms() {
            //     this.visibleTerms = [];
            //     this.showWithNoTerm = false;
            // },
            // changeFeatureColor() {
            //     let alpha = this.vectorLayersOpacity + 0.3;
            //     let index = this.terms.findIndex(term => term.id === this.featureSelectedData.term[0])
            //     let fillColor = this.featureSelectedData.term.length == 1 ? hexToRgb(this.terms[index].color, alpha) : [204, 204, 204, alpha];
            //     this.featureSelected.setStyle(new Style({
            //         fill: new Fill({
            //             color: fillColor,
            //         }),
            //         stroke: new Stroke({
            //             color: [0, 0, 0, alpha],
            //             width: 3,
            //         })
            //     }))
            // },
            // handlePost(termId) {
            //     if (this.featureSelectedDataToShow.term.length > this.featureTerms.length) {
            //         api.delete(`/api/annotation/${this.featureSelected.getId()}/term/${termId}.json`).then(data => {
            //             let index = this.featureSelectedDataToShow.term.findIndex(term => term === termId);
            //             this.featureSelectedData.term.splice(index, 1);
            //             this.changeFeatureColor()
            //         })
            //     } else {
            //         api.post(`/api/annotation/${this.featureSelected.getId()}/term/${termId}.json`, {
            //             term: termId,
            //             userannotation: this.featureSelected.getId()
            //         }).then(data => {
            //             this.featureSelectedData.term.push(termId);
            //             this.changeFeatureColor()
            //         })
            //     }
            // }
        }
    }
</script>
