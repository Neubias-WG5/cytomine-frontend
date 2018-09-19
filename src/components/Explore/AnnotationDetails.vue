<template>
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
                            <dd><username :user="userById(annotation.user)"></username></dd>
                            <dt>Created</dt>
                            <dd><date-item :value="annotation.created"></date-item></dd>
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
                            <button class="btn btn-default">Add a comment</button>
                            <!-- @click="showCommentModal(annotation.id)" -->
                        </div>
                    </section>
                    <section v-if="mustBeShown('project-explore-annotation-similarities')">
                        <h5><i class="fas fa-magic"></i> Similarities</h5>
                        <template v-if="isRetrievalActive">
                            <ol v-if="suggestedTerms && suggestedTerms.length > 0">
                                <li v-for="term in suggestedTerms" :key="'suggestedTerm-'+term.id">
                                    <term v-bind="termById(term.id)"></term> ({{term.percentage}} %)
                                    <!--<div class="btn-group">-->
                                    <!--<button class="btn btn-default btn-xs">Add</button>-->
                                    <!--<button class="btn btn-default btn-xs">Replace</button>-->
                                    <!--</div>-->
                                </li>
                            </ol>
                            <div class="text-center">
                                <button class="btn btn-default">See similar annotations</button>
                            </div>
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
</template>

<script>
    import mustBeShown from '../../helpers/mustBeShown'
    import VueDragResize from 'vue-drag-resize'
    import Term from "../Ontology/Term";
    import Username from "../User/Username";
    import DateItem from "../Datatable/DateItem";

    export default {
        name: 'AnnotationDetails',
        components: {
            VueDragResize,
            Term,
            Username,
            DateItem,
        },
        data() {
            return {
                annotation: null,
                focus: false,
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
        ],
        computed: {
            editable() {
                return this.annotation.class != "be.cytomine.ontology.AlgoAnnotation"
                    && (this.findIndex(this.project.admins, this.currentUser.id) != -1
                        || (!this.project.isReadOnly && !this.project.isRestricted)
                        || (this.currentUser.id == this.annotation.user && this.project.isRestricted));
            },
            isRetrievalActive() {
                return !this.project.retrievalDisable && !this.project.hideUsersLayer && !this.project.hideAdminsLayer;
            },
        },
        asyncComputed: {
            suggestedTerms() {
                if (!this.annotation || !this.isRetrievalActive)
                    return [];

                api.get(`/api/annotation/${this.annotation.id}/retrieval.json`).then(response => {
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

                    return toReturn;
                })
            }
        },
        watch: {
            selectedFeature(newFeature) {
                this.getAnnotation(newFeature);
            },
        },
        methods: {
            getAnnotation(newFeature) {
                if (!newFeature || newFeature == {})
                    this.annotation = null;
                else {
                    api.get(`api/annotation/${newFeature.id}.json`).then(response => {
                        this.annotation = response.data;
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
