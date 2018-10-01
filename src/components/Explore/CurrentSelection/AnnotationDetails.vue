<template>
    <div>
        <vue-drag-resize :parentLimitation="true" :isResizable="false"
                         :w="300" :h="300" :x="2 * this.elementWidth / 3" :y="150"
                         :isActive="this.focus" :parentW="this.elementWidth" :parentH="this.elementHeight"
                         @dragstop="setFocus(false)" @clicked="setFocus(true)">
            <div class="panel component-panel" :style="`width: 300px; height:300px;`">
                <div class="panel-body">
                    <section v-if="this.annotation && mustBeShown('project-explore-annotation-main')">
                        <h4><i class="fas fa-mouse-pointer"></i> Current selection</h4>
                        <section v-if="mustBeShown('project-explore-annotation-info')">
                            <h5><i class="fas fa-info-circle"></i> General information</h5>
                            <dl class="dl-horizontal">
                                <dt>Area</dt>
                                <dd>{{Math.round(annotation.area)}} {{annotation.areaUnit}}</dd>
                                <dt>Perimeter</dt>
                                <dd>{{Math.round(annotation.perimeter)}} {{annotation.perimeterUnit}}</dd>
                                <dt>Term(s)</dt>
                                <template v-if="annotation.term.length > 0">
                                    <dd v-for="term in annotation.term" :key="'term-'+term">
                                        <term v-bind="termById(term)"></term>
                                    </dd>
                                </template>
                                <dd v-else><span class="label label-default">No term</span></dd>
                                <dt>User</dt>
                                <dd>
                                    <username :user="userById(annotation.user)"></username>
                                </dd>
                                <dt>Created</dt>
                                <dd>
                                    <date-item :value="annotation.created"></date-item>
                                </dd>
                                <dt>Editable</dt>
                                <dd v-if="editable">
                                <span class="label label-success">
                                    <i class="fas fa-check-circle"></i>
                                    Yes
                                </span>
                                </dd>
                                <dd v-else>
                                <span class="label label-danger">
                                    <i class="fas fa-times-circle"></i>
                                    Read-only
                                </span>
                                </dd>
                            </dl>
                        </section>
                        <section v-if="mustBeShown('project-explore-annotation-preview')">
                            <h5><i class="fas fa-crop-alt"></i> Annotation preview</h5>
                            <img class="thumbnail" :src="annotation.smallCropURL+'&alphaMask=true'"
                                 alt="A crop of the annotation area">
                        </section>
                        <section v-if="mustBeShown('project-explore-annotation-comments')">
                            <h5>
                                <i class="fas fa-comments"></i>
                                Comments <span class="label label-info">{{annotation.nbComments}}</span>
                            </h5>
                            <div class="text-center">
                                <button class="btn btn-default" @click="openCommentModal = true">Add a comment</button>
                                <!-- @click="showCommentModal(annotation.id)" -->
                            </div>
                        </section>
                        <section v-if="mustBeShown('project-explore-annotation-similarities')">
                            <h5><i class="fas fa-magic"></i> Similarities</h5>
                            <template v-if="isRetrievalActive">
                                <template v-if="suggestedTerms === -1">
                                    <div class="text-center">
                                        Retrieval server unavailable.
                                    </div>
                                </template>
                                <template v-else-if="suggestedTerms && suggestedTerms.length > 0">
                                    <ol>
                                        <li v-for="term in suggestedTerms" :key="'suggestedTerm-'+term.id"
                                            v-if="term.percentage > 15">
                                            <term v-bind="termById(term.id)"></term>
                                            ({{Math.round(term.percentage * 100) / 100}} %)
                                            <div class="btn-group">
                                                <!--<button class="btn btn-default btn-xs">Add</button>-->
                                                <button class="btn btn-default btn-xs"
                                                        v-if="!associableTerms.includes(term.id)"
                                                        @click="replaceTermBySuggested(term.id)">
                                                    <i class="fas fa-exchange-alt"></i> Replace
                                                </button>
                                            </div>
                                        </li>
                                    </ol>
                                    <div class="text-center">
                                        <button class="btn btn-default" @click="openSimilaritiesModal = true">See
                                            similar annotations
                                        </button>
                                    </div>
                                </template>
                                <template v-else-if="suggestedTerms && suggestedTerms.length == 0">
                                    <div class="text-center">
                                        No similarities found.
                                    </div>
                                </template>
                                <template v-else>
                                    <div class="text-center">
                                        <i class="fas fa-spinner fa-spin"></i> Loading...
                                    </div>
                                </template>

                            </template>
                            <template v-else>
                                Retrieval is disabled.
                            </template>
                        </section>
                        <!--<section v-if="mustBeShown('project-explore-annotation-properties')">-->
                        <!--<h5>Properties</h5>-->
                        <!--<div class="text-center">-->
                        <!--<a :href="'#tabs-annotationproperties-'+ annotation.image +'-'+annotation.id"-->
                        <!--class="btn btn-default">Add a property</a>-->
                        <!--</div>-->
                        <!--</section>-->
                        <!--<section v-if="mustBeShown('project-explore-annotation-description')">-->
                        <!--<h5>Description</h5>-->
                        <!--<div class="text-center">-->
                        <!--<a :href="'#descriptionModal'+annotation.id" class="btn btn-default">Add description</a>-->
                        <!--</div>-->
                        <!--</section>-->
                    </section>
                </div>
            </div>
        </vue-drag-resize>

        <annotation-comments-modal v-if="annotation" :open.sync="openCommentModal" :annotation="annotation"
                                   :project="project" :current-user="currentUser" :users="users"
                                   @updateNbComments="updateNbComments">
        </annotation-comments-modal>

        <annotation-similarities-modal v-if="annotation" :open.sync="openSimilaritiesModal" :annotation="annotation">

        </annotation-similarities-modal>
    </div>

</template>

<script>
    import mustBeShown from '../../../helpers/mustBeShown'
    import VueDragResize from 'vue-drag-resize'
    import Term from "../../Ontology/Term";
    import Username from "../../User/Username";
    import DateItem from "../../Datatable/DateItem";
    import AnnotationCommentsModal from "./AnnotationCommentsModal";
    import AnnotationSimilaritiesModal from "./AnnotationSimilaritiesModal";
    import difference from "lodash.difference"
    import clone from "lodash.clone"

    export default {
        name: 'AnnotationDetails',
        components: {
            AnnotationSimilaritiesModal,
            AnnotationCommentsModal,
            VueDragResize,
            Term,
            Username,
            DateItem,
        },
        data() {
            return {
                annotation: null,
                focus: false,
                openCommentModal: false,
                openSimilaritiesModal: false,
                similarAnnotations: null,
            }
        },
        props: [
            'project',
            'projectConfig',
            'terms',
            'users',
            'currentUser',
            'selectedFeature',
            'elementWidth',
            'elementHeight',
            'associableTerms',
        ],
        computed: {
            editable() {
                return this.annotation.class != "be.cytomine.ontology.AlgoAnnotation"
                    && (this.findIndex(this.project.admins, this.currentUser.id) != -1
                        || (!this.project.isReadOnly && !this.project.isRestricted)
                        || (this.currentUser.id == this.annotation.user && this.project.isRestricted));
            },
            isRetrievalActive() {
                return !this.project.retrievalDisable && !this.project.hideUsersLayer && !this.project.hideAdminsLayer
                    && this.selectedFeature.geometry.type != 'Point' && this.selectedFeature.geometry.type != 'LineString';
            },
        },
        asyncComputed: {
            suggestedTerms() {
                if (!this.annotation || !this.isRetrievalActive)
                    return undefined;

                return api.get(`/api/annotation/${this.annotation.id}/retrieval.json`).then(response => {
                    let sum = 0;
                    let toReturn = [];
                    response.data.term.forEach(term => {
                        sum += term.rate;
                    });
                    response.data.term.forEach(term => {
                        if (term.rate > 0) {
                            term.percentage = (term.rate / sum) * 100;
                            toReturn.push(term);
                        }
                    });

                    this.similarAnnotations = response.data.annotation;

                    return toReturn;
                }).catch(errors => {
                    return -1
                })
            }
        },
        watch: {
            selectedFeature(newFeature) {
                this.getAnnotation(newFeature);
            },
            associableTerms(newList) {
                if (!this.annotation)
                    return;

                let termsToAdd = difference(newList, this.annotation.term);
                let termsToRemove = difference(this.annotation.term, newList);
                termsToAdd.forEach(termId => {
                    api.post(`api/annotation/${this.annotation.id}/term/${termId}.json`, {
                        term: termId,
                        userannotation: this.annotation.id
                    }).then(response => {
                        //TODO: [NOTIFICATION]
                        this.annotation.term.push(termId);
                        let feature = this.selectedFeature;
                        feature.properties.terms = this.annotation.term;
                        this.$emit('updateFeature', {
                            layerId: this.annotation.user,
                            featureId: this.annotation.id,
                            terms: this.annotation.term
                        });
                        this.$emit('update:selectedFeature', feature);
                    }).catch(errors => {
                        //TODO: [NOTIFICATION]
                    })
                });
                termsToRemove.forEach(termId => {
                    api.delete(`api/annotation/${this.annotation.id}/term/${termId}.json`).then(response => {
                        //TODO: [NOTIFICATION]
                        this.annotation.term = newList;
                        let feature = this.selectedFeature;
                        feature.properties.terms = this.annotation.term;
                        this.$emit('updateFeature', {
                            layerId: this.annotation.user,
                            featureId: this.annotation.id,
                            terms: this.annotation.term
                        });
                        this.$emit('update:selectedFeature', feature);
                    }).catch(errors => {
                        //TODO: [NOTIFICATION]
                    })
                })
            }
        },
        methods: {
            getAnnotation(newFeature, callback = () => {
            }) {
                if (!newFeature || newFeature == {}) {
                    this.annotation = null;
                    this.similarAnnotations = null;
                }
                else {
                    api.get(`api/annotation/${newFeature.properties.id}.json`).then(response => {
                        this.annotation = response.data;
                        this.$emit('update:associableTerms', clone(this.annotation.term));
                        callback()
                    })
                }
            },
            findIndex(array, toFind) {
                return array.findIndex(item => item.id === toFind);
            },
            userById(userId) {
                return this.users.find(user => user.id === userId);
            },
            termById(termId) {
                return this.terms.find(term => term.id == termId);
            },
            mustBeShown(key) {
                return mustBeShown(key, this.projectConfig);
            },
            setFocus(focus) {
                this.focus = focus;
            },
            updateNbComments(value) {
                this.annotation.nbComments = value;
            },
            replaceTermBySuggested(termId) {
                api.post(`api/annotation/${this.annotation.id}/term/${termId}/clearBefore.json`, {}).then(response => {
                    //TODO: [NOTIFICATION]
                    let callback = function () {
                        let feature = this.selectedFeature;
                        feature.properties.terms = this.annotation.term;
                        this.$emit('updateFeature', {
                            layerId: this.annotation.user,
                            featureId: this.annotation.id,
                            terms: this.annotation.term
                        });
                        this.$emit('update:selectedFeature', feature);
                    };
                    this.getAnnotation(this.selectedFeature, callback.bind(this));
                }).catch(errors => {
                    //TODO: [NOTIFICATION]
                })
            }
        },
        mounted() {
            if (this.selectedFeature) {
                this.getAnnotation(this.selectedFeature)
            }
        }
    }
</script>

<style scoped>
    .dl-horizontal dt {
        width: 80px;
    }

    .dl-horizontal dd {
        margin-left: 100px;
    }

    .thumbnail {
        margin-left: auto;
        margin-right: auto;
    }

    ol {
        list-style-type: decimal;
    }

    h4 {
        border-bottom: 1px solid black;
    }

    h5 {
        font-weight: bold;
    }
</style>
