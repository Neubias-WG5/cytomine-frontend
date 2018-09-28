<template>
    <section>
        <h4><i class="fas fa-palette"></i> Ontology</h4>

        <ontology-tree :ontology="ontology" :editable="false" :visible-terms="visibleTerms"
                       :associated-terms="associableTerms" :size-terms="sizeTerms" @showAllTerms="showAllTerms"
                       @toggleAssociateTerm="toggleAssociateTerm" @toggleVisibilityTerm="toggleVisibilityTerm">
        </ontology-tree>

        <div class="checkbox">
            <label>
                <input :checked="visibleNoTerm" @input="$emit('update:visibleNoTerm', !visibleNoTerm)"
                       type="checkbox" name="showNoTermAnnotation" id="showNoTermAnnotation">
                <label for="showNoTermAnnotation">Show annotations without terms</label>
            </label>
        </div>
    </section>
</template>

<script>
    import OntologyTree from "../../Ontology/OntologyTree";

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
            return { }
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
        }
    }
</script>
