<template>
    <div>
        <h4>
            <i class="fas fa-shapes"></i> Visible annotations
        </h4>
        <div v-if="hasReviewLayer">
            <label class="radio-inline">
                <input type="radio" v-model="reviewed" :value="true"> Reviewed
            </label>
            <label class="radio-inline">
                <input type="radio" v-model="reviewed" :value="false"> Not reviewed
            </label>
        </div>
        <div class="btn-group">
            <button @click="setFilter(null)" :class="['btn', 'btn-default', {active: filter == null}]">All with term(s)
            </button>
            <button @click="setFilter(term.id)" :class="['btn', 'btn-default', {active: filter == term.id}]"
                    v-for="term in visibleTerms" :key="term.id + uuid()">
                <term :size="sizeTerms[term.id]" :name="term.name" :color="term.color"></term>
            </button>
            <button @click="setFilter('noterm')" :class="['btn', 'btn-default', {active: filter == 'noterm'}]"
                    v-if="visibleNoTerm">
                <span class="label label-default">No term</span>
            </button>
        </div>
        <div class="pull-right">
            <paginate v-if="totalPages > 1" :page-count="totalPages" v-model="page" :container-class="'pagination'"
                      :prev-text="'&laquo;'" :next-text="'&raquo;'"></paginate>
        </div>
        <div class="clearfix"></div>
        <annotation-list :annotations="annotations" :is-reviewing="isReviewing" :users="users" :terms="terms"
                         :loading="loading"></annotation-list>
    </div>
</template>

<script>
    import Popper from 'vue-popperjs';
    import Paginate from 'vuejs-paginate';

    import Term from "../../Ontology/Term";
    import Username from "../../User/Username";
    import DateItem from "../../Datatable/DateItem";

    import uuid from 'uuid'
    import AnnotationList from "../../Annotations/AnnotationList";


    export default {
        name: 'Annotations',
        components: {
            AnnotationList,
            DateItem,
            Username,
            Term,
            Popper,
            Paginate
        },
        data() {
            return {
                filter: null,
                reviewed: true,
                page: 1,
                max: 10,
                totalPages: 0,
                rev: 0,
                previousNbVisibleAnnotations: 0,
                loading: false,
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
            'sizeTerms',
            'nbVisibleAnnotations',
            'active',
            'hasReviewLayer'
        ],
        asyncComputed: {
            annotations() {
                let _ = this.rev;
                if ((this.visibleTermIds.length == 0 && !this.filter) || this.visibleUserIds.length == 0) {
                    this.totalPages = 0;
                    this.page = 1;
                    return [];
                }
                this.loading = true;
                let terms;
                if (this.filter == 'noterm')
                    terms = `&noTerm=true`;
                else if (this.filter)
                    terms = `&term=${this.filter}`;
                else
                    terms = (this.visibleTermIds.length > 0) ? `&terms=${this.visibleTermIds.join(',')}` : '';
                let users = (this.visibleUserIds.length > 0) ? `&users=${this.visibleUserIds.join(',')}` : '';

                let reviewed;
                if (this.hasReviewLayer) {
                    reviewed = (this.reviewed) ? `&reviewed=true` : `&notReviewedOnly=true`;
                    users = (this.reviewed) ? '' : users;
                }
                else
                    reviewed = '';

                let page = Math.max(0, (this.page - 1));
                return api.get(`/api/annotation.json?image=${this.image.id}${reviewed}&max=${this.max}&offset=${page * this.max}${terms}${users}`).then(data => {
                    let annots = data.data.collection;
                    this.totalPages = data.data.totalPages;
                    if (this.page >= this.totalPages)
                        this.page = this.totalPages;
                    this.loading = false;
                    return annots;
                }).catch(error => {
                    this.loading = false;
                });
            },
        },
        computed: {
            visibleTerms() {
                return this.terms.filter(term => this.visibleTermIds.includes(term.id))
            },
        },
        watch: {
            nbVisibleAnnotations(newValue, oldValue) {
                if (newValue != oldValue)
                    this.rev++;
            },
            active(newValue, oldValue) {
                if (newValue && !oldValue && this.nbVisibleAnnotations != this.previousNbVisibleAnnotations) {
                    this.previousNbVisibleAnnotations = this.nbVisibleAnnotations;
                    this.rev++;
                }
            }
        },
        methods: {
            uuid,
            setFilter(filter) {
                this.filter = filter;
                this.page = 1;
            },
            userById(userId) {
                return this.users.find(user => user.id === userId);
            },
            termById(termId) {
                return this.terms.find(term => term.id == termId);
            },
            cropURL(url) {
                return `${url.substring(0, url.indexOf('?'))}?maxSize=90&alphaMask=true&point=true`
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

    .pagination {
        margin: 0;
    }

    .pagination li {
        cursor: pointer;
    }
</style>

