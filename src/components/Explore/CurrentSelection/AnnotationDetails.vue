<template>
    <div>
        <vue-drag-resize :parentLimitation="true" :isResizable="false"
                         :w="300" :h="300" :x="2 * this.elementWidth / 3" :y="150"
                         :isActive="this.focus" :parentW="this.elementWidth" :parentH="this.elementHeight"
                         @dragstop="setFocus(false)" @clicked="setFocus(true)">
            <div class="panel component-panel" :style="`width: 300px; height:300px;`">
                <div class="panel-body">
                    <section v-if="this.selectedAnnotation && mustBeShown('project-explore-annotation-main')">
                        <h4><i class="fas fa-mouse-pointer"></i> Current selection</h4>
                        <section v-if="mustBeShown('project-explore-annotation-info')">
                            <h5><i class="fas fa-info-circle"></i> General information</h5>
                            <dl class="dl-horizontal">
                                <dt>Area</dt>
                                <dd>{{Math.round(selectedAnnotation.area)}} {{selectedAnnotation.areaUnit}}</dd>
                                <dt>Perimeter</dt>
                                <dd>{{Math.round(selectedAnnotation.perimeter)}} {{selectedAnnotation.perimeterUnit}}</dd>
                                <dt>Term(s)</dt>
                                <template v-if="selectedAnnotation.term.length > 0">
                                    <dd v-for="term in selectedAnnotation.term" :key="'term-'+term">
                                        <term v-bind="termById(term)"></term>
                                    </dd>
                                </template>
                                <dd v-else><span class="label label-default">No term</span></dd>
                                <dt>User</dt>
                                <dd>
                                    <username :user="userById(selectedAnnotation.user)"></username>
                                </dd>
                                <dt>Created</dt>
                                <dd>
                                    <date-item :value="selectedAnnotation.created"></date-item>
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
                            <img class="thumbnail" :src="selectedAnnotation.smallCropURL+'&alphaMask=true'"
                                 alt="A crop of the annotation area">
                        </section>
                        <section v-if="mustBeShown('project-explore-annotation-comments')">
                            <h5>
                                <i class="fas fa-comments"></i>
                                Comments <span class="label label-info">{{selectedAnnotation.nbComments}}</span>
                            </h5>
                            <div class="text-center">
                                <button class="btn btn-default" @click="openCommentModal = true">Add a comment</button>
                                <!-- @click="showCommentModal(selectedAnnotation.id)" -->
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
                        <!--<a :href="'#tabs-annotationproperties-'+ selectedAnnotation.image +'-'+selectedAnnotation.id"-->
                        <!--class="btn btn-default">Add a property</a>-->
                        <!--</div>-->
                        <!--</section>-->
                        <!--<section v-if="mustBeShown('project-explore-annotation-description')">-->
                        <!--<h5>Description</h5>-->
                        <!--<div class="text-center">-->
                        <!--<a :href="'#descriptionModal'+selectedAnnotation.id" class="btn btn-default">Add description</a>-->
                        <!--</div>-->
                        <!--</section>-->
                    </section>
                </div>
            </div>
        </vue-drag-resize>

        <annotation-comments-modal v-if="selectedAnnotation" :open.sync="openCommentModal" :annotation="selectedAnnotation"
                                   :project="project" :current-user="currentUser" :users="users"
                                   @updateNbComments="updateNbComments">
        </annotation-comments-modal>

        <annotation-similarities-modal v-if="selectedAnnotation" :open.sync="openSimilaritiesModal" :annotation="selectedAnnotation">

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
            'selectedAnnotation',
            'elementWidth',
            'elementHeight',
            'associableTerms',
        ],
        computed: {
            editable() {
                return this.selectedAnnotation.class != "be.cytomine.ontology.AlgoAnnotation"
                    && (this.findIndex(this.project.admins, this.currentUser.id) != -1
                        || (!this.project.isReadOnly && !this.project.isRestricted)
                        || (this.currentUser.id == this.selectedAnnotation.user && this.project.isRestricted));
            },
            isRetrievalActive() {
                return !this.project.retrievalDisable && !this.project.hideUsersLayer && !this.project.hideAdminsLayer
                    && this.selectedFeature.geometry.type != 'Point' && this.selectedFeature.geometry.type != 'LineString';
            },
        },
        asyncComputed: {
            suggestedTerms() {
                if (!this.selectedAnnotation || !this.isRetrievalActive)
                    return undefined;

                return api.get(`/api/annotation/${this.selectedAnnotation.id}/retrieval.json`).then(response => {
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
        },
        methods: {
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
                let annotation = this.selectedAnnotation;
                annotation.nbComments = value;
                this.$emit('update:selectedAnnotation', annotation);
            },
            replaceTermBySuggested(termId) {
                api.post(`api/annotation/${this.selectedAnnotation.id}/term/${termId}/clearBefore.json`, {}).then(response => {
                    //TODO: [NOTIFICATION]
                    let annotation = this.selectedAnnotation;
                    annotation.term = [termId];
                    this.$emit('update:selectedAnnotation', annotation);

                    let feature = this.selectedFeature;
                    feature.properties.terms = [termId];
                    this.$emit('updateFeature', {
                        layerId: this.selectedAnnotation.user,
                        featureId: this.selectedAnnotation.id,
                        terms: this.selectedAnnotation.term
                    });

                    this.$emit('update:selectedFeature', feature);
                    this.$emit('update:associableTerms', [termId]);
                }).catch(errors => {
                    //TODO: [NOTIFICATION]
                })
            }
        },
        mounted() {
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
