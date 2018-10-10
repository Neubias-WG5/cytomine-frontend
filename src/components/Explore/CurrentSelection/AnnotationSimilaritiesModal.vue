<template>
    <modal v-model="openModal" @hide="close">
        <template slot="title">
            Similar annotations for annotation #{{annotation.id}}
        </template>
        <h4>Current selection</h4>
        <div class="annotations-container">
            <annotation :annotation="annotation" :is-reviewing="false" :users="users" :terms="terms"></annotation>
            <div>
                <dl class="dl-horizontal">
                    <dt>Currently linked term(s)</dt>
                    <dd>
                        <ol v-if="annotation.term.length > 0">
                            <li v-for="term in annotation.term" :key="term + uuid()">
                                <term v-bind="termById(term)"></term><br/>
                            </li>
                        </ol>
                        <span class="label label-default" v-else>No term</span>
                    </dd>
                    <dt>Suggested term(s)</dt>
                    <dd>
                        <ol>
                            <li v-for="term in suggestedTerms" :key="'suggestedTerm-'+term.id"
                                v-if="term.percentage > 15">
                                <term v-bind="termById(term.id)"></term>
                                ({{Math.round(term.percentage * 100) / 100}} %)
                            </li>
                        </ol>
                    </dd>
                </dl>
            </div>
        </div>
        <h4>Similarities</h4>
        <annotation-list :annotations="similaritiesSorted" :is-reviewing="false" :users="users" :terms="terms"></annotation-list>
    </modal>
</template>

<script>
    import {Modal} from "uiv";
    import uuid from 'uuid'

    import AnnotationList from "../../Annotations/AnnotationList";
    import Annotation from "../../Annotations/Annotation";
    import Term from "../../Ontology/Term";

    export default {
        name: "AnnotationSimilaritiesModal",
        components: {
            Modal,
            AnnotationList,
            Annotation,
            Term
        },
        data() {
            return {
                openModal: this.open,
            }
        },
        props: [
            'open',
            'annotation',
            'users',
            'similarities',
            'terms',
            'suggestedTerms'
        ],
        computed: {
            similaritiesSorted() {
                if (!this.similarities)
                    return [];

                return this.similarities.sort((a, b) => {
                    return b.similarity - a.similarity
                })
            }
        },
        methods: {
            uuid,
            close() {
                this.$emit('update:open', false)
            },
            termById(termId) {
                return this.terms.find(term => term.id == termId);
            },
        },
        watch: {
            open(newValue) {
                this.openModal = newValue;
            },
        },
    }
</script>

<style scoped>
    .annotations-container {
        display: flex;
        list-style: none;
        flex-wrap: wrap;
        padding: 0;
        margin-top: 1em;
        justify-content: center;
    }

    ol {
        list-style-type: decimal;
    }
</style>
