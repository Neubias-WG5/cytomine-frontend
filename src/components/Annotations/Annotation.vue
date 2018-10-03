<template>
    <div class="img-box">
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
                        <template v-if="annotation.userByTerm && annotation.userByTerm.length > 0">
                            <dt>Term(s)</dt>
                            <dd v-for="term in annotation.userByTerm" :key="term.id + uuid()">
                                <term v-bind="termById(term.term)"></term><br/>
                                by
                                <span v-for="(user, index) in term.user" :key="user + uuid()">
                                            <username :user="userById(user)"></username>
                                            <span v-if="index + 1 < term.user.length">, </span>
                                        </span>
                            </dd>
                        </template>
                        <template v-else-if="annotation.term && annotation.term.length > 0">
                            <dt>Term(s)</dt>
                            <dd v-for="term in annotation.term" :key="term + uuid()">
                                <term v-bind="termById(term)"></term><br/>
                            </dd>
                        </template>
                    </dl>
                </div>
            </div>
            <div slot="reference">
                <a class="annot-link"
                   :href="`#tabs-${isReviewing ? 'review' : 'image'}-${annotation.project}-${annotation.id}-${annotation.id}`">
                    <img class="annot-img" :src="cropURL(annotation.smallCropURL)" alt="">
                </a>
                <div class="annot-info">
                    <div class="pull-right">
                        <i class="fas fa-check-circle" style="color:green;" v-if="annotation.reviewed"></i>
                    </div>
                    <div class="text-center">
                        <span class="label label-default" v-if="annotation.similarity">{{parseFloat(annotation.similarity).toExponential(3)}}</span>
                    </div>
                </div>
            </div>
        </popper>
    </div>
</template>

<script>
    import Popper from 'vue-popperjs';

    import Term from "../Ontology/Term";
    import Username from "../User/Username";
    import DateItem from "../Datatable/DateItem";

    import uuid from 'uuid'

    export default {
        name: "Annotation",
        components: {
            DateItem,
            Username,
            Term,
            Popper,
        },
        data() {
            return {
            }
        },
        props: [
            'users',
            'terms',
            'isReviewing',
            // 'sizeTerms',
            'annotation'
        ],
        methods: {
            uuid,
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

    .annot-info {
        position: relative;
        width: 90px;
        bottom: 22px;
        right: 5px;
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


