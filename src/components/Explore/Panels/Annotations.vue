<template>
    <div>
        <h4>
            <i class="fas fa-shapes"></i> Visible annotations
        </h4>
        <div class="btn-group">
            <button @click="setFilter(null)" :class="['btn', 'btn-default', {active: filter == null}]">All
            </button>
            <button @click="setFilter(term.id)" :class="['btn', 'btn-default', {active: filter == term.id}]"
                    v-for="term in visibleTerms" :key="term.id + uuid()">
                <term :size="sizeTerms[term.id]" :name="term.name" :color="term.color"></term>
            </button>
        </div>
        <div class="pull-right">
            <ul class="pagination" v-if="totalPages > 1">
                <li :class="{disabled: page == 0}">
                    <a @click="previousAnnotations" aria-label="Previous">
                        <span aria-hidden="true">&laquo;</span>
                    </a>
                </li>
                <li @click="page = (n-1)" v-for="n in totalPages" :key="n" :class="{active: n-1 == page}">
                    <a>
                        {{ n }}
                    </a>
                </li>
                <li :class="{disabled: page == totalPages - 1}">
                    <a @click="nextAnnotations" aria-label="Next">
                        <span aria-hidden="true">&raquo;</span>
                    </a>
                </li>
            </ul>
        </div>
        <div class="clearfix"></div>
        <ul class="annotations-container">
            <li class="img-box" v-for="annotation in annotations" :key="annotation.id + uuid()">
                <popper>
                    <div class="popper" trigger="hover" :options="{placement: 'auto'}">
                        <div class="annotation-detail">
                            <dl class="dl-horizontal">
                                <dt>Created by</dt>
                                <dd v-if="annotation.user !== undefined">
                                    <username :user="userById(annotation.user)"></username>
                                </dd>
                                <dt>Date</dt>
                                <dd>
                                    <date-item :value="annotation.created"></date-item>
                                </dd>
                                <template v-if="annotation.userByTerm[0]">
                                    <dt>Term(s)</dt>
                                    <dd v-for="term in annotation.userByTerm" :key="term.id + uuid()">
                                        <term v-bind="termById(term.term)"></term>&nbsp;by
                                        <span v-for="(user, index) in term.user" :key="user + uuid()">
                                            <username :user="userById(user)"></username>
                                            <span v-if="index + 1 < term.user.length">, </span>
                                        </span>
                                    </dd>
                                </template>
                            </dl>
                        </div>
                    </div>
                    <div slot="reference">
                        <a class="annot-link"
                           :href="`#tabs-${isReviewing ? 'review' : 'image'}-${image.project}-${image.id}-${annotation.id}`">
                            <img class="annot-img" :src="cropURL(annotation.smallCropURL)" alt="">
                        </a>
                    </div>
                </popper>
            </li>
            <div v-if="annotations && annotations.length == 0" class="alert alert-info mt-4">
                No annotation
            </div>
        </ul>
    </div>
</template>

<script>
    import Popper from 'vue-popperjs';

    import Term from "../../Ontology/Term";
    import Username from "../../User/Username";
    import DateItem from "../../Datatable/DateItem";

    import uuid from 'uuid'

    export default {
        name: 'Annotations',
        components: {
            DateItem,
            Username,
            Term,
            Popper,
        },
        data() {
            return {
                filter: null,
                page: 0,
                max: 10,
                totalPages: null
            }
        },
        props: [
            'image',
            'users',
            'terms',
            'isReviewing',
            'visibleNoTerm',
            'visibleTermIds',
            'visibleUserIds',
            'sizeTerms'
        ],
        asyncComputed: {
            annotations() {
                if (this.visibleTermIds.length == 0 || this.visibleUserIds.length == 0) {
                    this.totalPages = 0;
                    this.page = 0;
                    return [];
                }

                let terms;
                if (this.filter)
                    terms = `&term=${this.filter}`;
                else
                    terms = (this.visibleTermIds.length > 0) ? `&terms=${this.visibleTermIds.join(',')}` : '';
                let users = (this.visibleUserIds.length > 0) ? `&users=${this.visibleUserIds.join(',')}` : '';
                let reviewed = (this.isReviewing) ? 'true' : 'false';

                return api.get(`/api/annotation.json?&image=${this.image.id}&reviewed=${reviewed}&max=${this.max}&offset=${this.page * this.max}${terms}${users}`).then(data => {
                    let annots = data.data.collection;
                    this.totalPages = data.data.totalPages;
                    if (this.page >= this.totalPages)
                        this.page = 0;
                    // if (!this.filter && this.visibleNoTerm) {
                    //     api.get(`/api/annotation.json&image=${this.image.id}&reviewed=${reviewed}&max=${this.max}&offset=${this.page * this.max}&noTerm=true&${users}`).then(data => {
                    //         annots = annots.concat(data.data.collection)
                    //     })
                    // }
                    return annots;
                });
            },
        },
        computed: {
            visibleTerms() {
                return this.terms.filter(term => this.visibleTermIds.includes(term.id))
            },
        },
        methods: {
            uuid,
            previousAnnotations() {
                if (this.page !== 0)
                    this.page -= 1;
            },
            nextAnnotations() {
                if (this.page !== this.totalPages - 1)
                    this.page += 1;
            },
            setFilter(filter) {
                this.filter = filter;
                this.page = 0;
            },
            userById(userId) {
                return this.users.find(user => user.id === userId);
            },
            termById(termId) {
                return this.terms.find(term => term.id == termId);
            },
            cropURL(url) {
                return `${url.substring(0, url.indexOf('?'))}?maxSize=90&alphaMask=true`
            }
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

    .pagination {
        margin: 0;
    }

    .pagination li {
        cursor: pointer;
    }
</style>

