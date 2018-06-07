<template>
    <vue-drag-resize :parentLimitation="true" :isResizable="false" :w="300" :h="300" :x="2 * this.elementWidth / 3" :y="150"
                     :isActive="this.focus" :parentW="this.elementWidth" :parentH="this.elementHeight"
                     @dragstop="setFocus(false)" @clicked="setFocus(true)">
        <div class="panel component-panel" :style="`height:300px;`">
            <div class="panel-body">
                <section v-if="annotationIsClicked && mustBeShown('project-explore-annotation-main')">
                    <h3>Current selection</h3>
                    <section v-if="mustBeShown('project-explore-annotation-info')">
                        <h4>General information</h4>
                        <dl class="dl-horizontal">
                            <dt>Area</dt>
                            <dd>{{Math.round(data.area)}} {{data.areaUnit}}</dd>
                            <dt>Perimeter</dt>
                            <dd>{{Math.round(data.perimeter)}} {{data.perimeterUnit}}</dd>
                            <dt>Term(s)</dt>
                            <template v-if="data.term.length > 0">
                                <dd v-for="term in data.term" :key="'term-'+term">
                                    <span class="glyphicon glyphicon-stop" :style="`color: ${getTermColor(term)};`">
                                    </span>
                                    {{displayTerm(term)}}
                                </dd>
                            </template>
                            <dd v-else><span class="label label-default">No term</span></dd>
                            <dt>User</dt>
                            <dd>{{displayName(data.user)}}</dd>
                            <dt>Created</dt>
                            <dd>{{humanDate(data.created)}}</dd>
                            <dt>Editable</dt>
                            <dd v-if="editable">
                                <span class="label label-success">
                                    <span class="glyphicon glyphicon-ok" aria-hidden="true"></span>
                                    Yes
                                </span>
                            </dd>
                            <dd v-else>
                                <span class="label label-danger">
                                    <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                    Read-only
                                </span>
                            </dd>
                        </dl>
                    </section>
                    <section v-if="mustBeShown('project-explore-annotation-preview')">
                        <h4>Annotation preview</h4>
                        <img class="thumbnail" :src="data.smallCropURL+'&alphaMask=true'"
                             alt="A crop of the annotation area">
                    </section>
                    <section v-if="mustBeShown('project-explore-annotation-comments')">
                        <h4>Comments <span class="label label-info">{{data.nbComments}}</span></h4>
                        <div class="text-center">
                            <button class="btn btn-default">Add a comment</button>
                            <!-- @click="showCommentModal(data.id)" -->
                        </div>
                    </section>
                    <section v-if="mustBeShown('project-explore-annotation-similarities')">
                        <h4>Similarities</h4>
                        <template v-if="isRetrievalActive">
                            <ol v-if="suggestedTerms.length > 0">
                                <li v-for="term in suggestedTerms" :key="'suggestedTerm-'+term.id">
                                    <span class="glyphicon glyphicon-stop" :style="`color: ${getTermColor(term.id)};`">
                                    </span>
                                    {{displayTerm(term.id)}} ({{term.percentage}} %)
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
                    <section v-if="mustBeShown('project-explore-annotation-properties')">
                        <h4>Properties</h4>
                        <div class="text-center">
                            <a :href="'#tabs-annotationproperties-'+ data.container +'-'+data.id"
                               class="btn btn-default">Add a property</a>
                        </div>
                    </section>
                    <section v-if="mustBeShown('project-explore-annotation-description')">
                        <h4>Description</h4>
                        <div class="text-center">
                            <a :href="'#descriptionModal'+data.id" class="btn btn-default">Add description</a>
                        </div>
                    </section>
                </section>
            </div>
        </div>
    </vue-drag-resize>
</template>

<script>
    import humanDate from '../../helpers/humanDate'
    import mustBeShown from '../../helpers/mustBeShown'
    import Axios from 'axios';
    import VueDragResize from 'vue-drag-resize'

    export default {
        name: 'AnnotationDetails',
        components: {
            VueDragResize
        },
        data() {
            return {
                annotationIsClicked: false,
                data: {},
                suggestedTerms: [],
                source: null,
                focus: false,
            }
        },
        props: [
            'currentMap',
            'featureSelected',
            'users',
            'terms',
            'currentUser',
            'project',
            'elementWidth',
            'elementHeight',
        ],
        computed: {
            editable() {
                return this.data.class != "be.cytomine.ontology.AlgoAnnotation"
                    && (this.findIndex(this.project.admins, this.currentUser.id) != -1
                        || (!this.project.isReadOnly && !this.project.isRestricted)
                        || (this.currentUser.id == this.data.user && this.project.isRestricted));
            },
            isRetrievalActive() {
                return !this.project.retrievalDisable && !this.project.hideUsersLayer && !this.project.hideAdminsLayer;
            },
        },
        watch: {
            featureSelected(newFeature, oldFeature) {
                const CancelToken = Axios.CancelToken;

                if (oldFeature === undefined || oldFeature.hasOwnProperty('id_')) {
                    this.annotationIsClicked = false;
                    this.suggestedTerms = [];
                    if (this.source) this.source.cancel();
                }
                if (newFeature !== undefined) {
                    api.get(`/api/annotation/${newFeature.getId()}.json`).then(data => {
                        this.data = data.data;
                        this.$emit('featureSelectedData', this.data);
                        this.annotationIsClicked = true;

                        if (this.isRetrievalActive) {
                            this.source = CancelToken.source();
                            // Very slow request, use a cancel token to kill it if annotation is changed before reception.
                            api.get(`/api/annotation/${this.data.id}/retrieval.json`, {cancelToken: this.source.token}).then(data => {
                                let sum = 0;
                                data.data.term.forEach(term => {
                                    sum += term.rate;
                                });
                                data.data.term.forEach(term => {
                                    if (term.rate > 0) {
                                        term.percentage = (term.rate / sum) * 100;
                                        this.suggestedTerms.push(term);
                                    }
                                })
                            })
                        }
                    })
                } else {
                    this.annotationIsClicked = false;
                    this.suggestedTerms = [];
                    if (this.source) this.source.cancel();
                }
            }
        },
        methods: {
            findIndex(array, toFind) {
                return array.findIndex(item => item.id === toFind);
            },
            displayName(userId) {
                let index = this.findIndex(this.users, userId);
                let user = this.users[index];
                if (user.algo) {
                    return `${user.softwareName} (${user.username})`;
                }
                return `${user.lastname} ${user.firstname} (${user.username})`;
            },
            displayTerm(termId) {
                let index = this.findIndex(this.terms, termId);
                return this.terms[index].key;
            },
            getTermColor(termId) {
                let index = this.findIndex(this.terms, termId);
                return this.terms[index].color;
            },
            humanDate(date) {
                return humanDate(date);
            },
            mustBeShown(key) {
                return mustBeShown(key, this.currentMap.projectConfig);
            },
            setFocus(focus) {
                this.focus = focus;
            }
            // showCommentModal(annotationId) {
            //     return window.app.controllers.annotation.share(annotationId)
            // }
        },
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
</style>
