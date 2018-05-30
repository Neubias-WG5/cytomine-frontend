<template>
    <div>
        <div class="btn-group">
            <button @click="getAnnotations(30, 0)" :class="['btn', 'btn-default', {active: filter == null}]">All
            </button>
            <button @click="getAnnotations(30, 0, term.id)" :class="['btn', 'btn-default', {active: filter == term.id}]"
                    v-for="term in terms" :key="term.id + uuid()">
                <span class="glyphicon glyphicon-stop" :style="`color: ${getTermColor(term.id)};`"></span>
                {{term.key}}
            </button>
        </div>
        <div>
            <ul class="pagination" v-if="totalPages > 0">
                <li :class="{disabled: currentPage == 0}">
                    <a @click="previousAnnotations" aria-label="Previous">
                        <span aria-hidden="true">&laquo;</span>
                    </a>
                </li>
                <li @click="getAnnotations(30, n - 1)" v-for="n in totalPages" :key="n"
                    :class="{active: n-1 == currentPage}">
                    <a>
                        {{ n }}
                    </a>
                </li>
                <li :class="{disabled: currentPage == totalPages - 1}">
                    <a @click="nextAnnotations" aria-label="Next">
                        <span aria-hidden="true">&raquo;</span>
                    </a>
                </li>
            </ul>
        </div>
        <ul class="annotations-container">
            <li class="img-box" v-for="annotation in annotations" :key="annotation.id + uuid()">
                <popper>
                    <div class="popper" trigger="hover" :options="{placement: 'auto'}">
                        <div class="annotation-detail">
                            <h4>Annotation details</h4>
                            <dl class="dl-horizontal">
                                <dt>Created by</dt>
                                <dd v-if="annotation.user !== undefined">{{userById(annotation.user)}}</dd>
                                <dt>Date</dt>
                                <dd>{{humanDate(annotation.created)}}</dd>
                                <template v-if="annotation.userByTerm[0]">
                                    <dt>Term(s)</dt>
                                    <dd v-for="term in annotation.userByTerm" :key="term.id + uuid()">
                                        <span class="glyphicon glyphicon-stop"
                                              :style="`color: ${getTermColor(term.term)};`"></span>
                                        {{termById(term.term)}} by
                                        <span v-for="(user, index) in term.user" :key="user + uuid()">
                                    {{userById(user)}}
                                    <span v-if="index + 1 < term.user.length">, </span>
                                </span>
                                    </dd>
                                </template>
                            </dl>
                        </div>
                    </div>
                    <div slot="reference">
                        <a class="annot-link"
                           :href="`#tabs-${isReviewing ? 'review' : 'image'}-${currentMap.data.project}-${currentMap.imageId}-${annotation.id}`">
                            <img class="annot-img" :src="cropURL(annotation.smallCropURL)" alt="">
                        </a>
                    </div>
                </popper>
            </li>
            <div v-if="annotations[0] == undefined" class="alert alert-info mt-4">
                No annotation
            </div>
        </ul>
    </div>
</template>

<script>
    import Popper from 'vue-popperjs';
    import uuid from 'uuid'
    import humanDate from '../../helpers/humanDate'

    export default {
        name: 'Annotations',
        components: {
            Popper,
        },
        data() {
            return {
                annotations: [],
                reviewedAnnotations: [],
                filter: null,
                totalPages: null,
                currentPage: 0,
            }
        },
        props: [
            'currentMap',
            'users',
            'terms',
            'isReviewing',
            'updateAnnotationsIndex'
        ],
        watch: {
            updateAnnotationsIndex(newValue) {
                if (newValue == true) {
                    this.getAnnotations(30, this.currentPage * 30);
                    this.$emit('updateAnnotationsIndex', false);
                }
            }
        },
        methods: {
            getAnnotations(max, page, term = null) {
                // TODO: what about hideUsersLayer & hideAdminsLayer ?
                this.currentPage = page;
                let termQuery = term != null ? `&term=${term}` : '';
                this.filter = term;
                api.get(`/api/annotation.json?&image=${this.currentMap.imageId}&reviewed=false&max=${max}&offset=${page * max}${termQuery}`).then(data => {
                    this.annotations = data.data.collection;
                    this.totalPages = data.data.totalPages;
                })
                if (this.isReviewing) {
                    api.get(`/api/annotation.json?&image=${this.currentMap.imageId}&showTerm=true&reviewed=true&notReviewedOnly=true&showMeta=true&max=${max}&offset=${page * max}${termQuery}`).then(data => {
                        this.reviewedAnnotations = data.data.collection;
                    })
                }
            },
            previousAnnotations() {
                if (this.currentPage !== 0) {
                    this.getAnnotations(30, this.currentPage - 1);
                }
            },
            nextAnnotations() {
                if (this.currentPage !== this.totalPages - 1) {
                    this.getAnnotations(30, this.currentPage + 1);
                }
            },
            uuid,
            userById(userId) {
                let index = this.users.findIndex(user => user.id === userId);
                return index < 0 ? null : `${this.users[index].lastname} ${this.users[index].firstname} (${this.users[index].username})`
            },
            termById(termId) {
                let index = this.terms.findIndex(term => term.id === termId);
                return index < 0 ? null : this.terms[index].key
            },
            getTermColor(termId) {
                let index = this.terms.findIndex(term => term.id === termId);
                return index < 0 ? null : this.terms[index].color;
            },
            humanDate(date) {
                return humanDate(date);
            },
            cropURL(url) {
                return `${url.substring(0, url.indexOf('?'))}?maxSize=90&alphaMask=true`

            }
        },
        created() {
            this.getAnnotations(30, 0);
        }
    }
</script>

<style scoped>
    .img-box {
        width: 100px;
        height: 100px;
    }

    .annot-img {
        max-width: 90px;
        max-height: 90px;
    }

    .annot-link {
        display: block;
        width: 90px;
        height: 90px;
        border: 1px solid rgb(240, 240, 240);
        text-align: center;
    }

    .annotations-container {
        display: flex;
        list-style: none;
        flex-wrap: wrap;
        padding: 0;
        margin-top: 1em;
    }

    .dl-horizontal dt {
        width: 80px;
    }

    .dl-horizontal dd {
        margin-left: 100px;
    }

    .annotation-detail {
        text-align: left;
        margin: 5px;
    }
</style>

