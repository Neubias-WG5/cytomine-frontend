<template>
    <modal v-model="open" :title="project.name" :footer="false" @hide="close">
        <blockquote v-if="description"><p>{{description}}</p></blockquote>

        <p class="lead">Users</p>

        <dl class="dl-horizontal">
            <dt>Creator</dt>
            <dd>
                <username-list :users="creators" :online="online"></username-list>
            </dd>

            <dt>Managers</dt>
            <dd>
                <username-list :users="admins" :online="online"></username-list>
            </dd>

            <dt>Contributors</dt>
            <dd>
                <username-list :users="contributors" :online="online"></username-list>
            </dd>

            <dt>Contact <i class="fa fa-envelope" aria-hidden="true"></i></dt>
            <dd>
                <ul class="list-unstyled" v-if="representatives.length > 0">
                    <li v-for="u in representatives">
                        <username :user="userById(u.user)"></username>
                        - {{userById(u.user).email}}
                    </li>
                </ul>
                <span v-else>No contact</span>
            </dd>
        </dl>

        <p class="lead">Statistics</p>

        <div class="stat row">
            <div class="col-lg-3 col-md-3 col-sm-6 col-xs-12">
                <div class="milestone-counter">
                    <i class="fa fa-picture-o fa-3x"></i>
                    <span class="stat-count highlight">{{project.numberOfImages}}</span>
                    <div class="milestone-details">images</div>
                </div>
            </div>
            <div class="col-lg-3 col-md-3 col-sm-6 col-xs-12">
                <div class="milestone-counter">
                    <i class="fa fa-puzzle-piece fa-3x"></i>
                    <span class="stat-count highlight">{{project.numberOfAnnotations}}</span>
                    <div class="milestone-details">user annotations</div>
                </div>
            </div>
            <div class="col-lg-3 col-md-3 col-sm-6 col-xs-12">
                <div class="milestone-counter">
                    <i class="fa fa-laptop fa-3x"></i>
                    <span class="stat-count highlight">{{project.numberOfJobAnnotations}}</span>
                    <div class="milestone-details">automated annotations</div>
                </div>
            </div>
            <div class="col-lg-3 col-md-3 col-sm-6 col-xs-12">
                <div class="milestone-counter">
                    <i class="fa fa-check-square-o fa-3x"></i>
                    <span class="stat-count highlight">{{project.numberOfReviewedAnnotations}}</span>
                    <div class="milestone-details">reviewed annotations</div>
                </div>
            </div>
        </div>

        <template v-if="images.length > 0">
            <p class="lead">Some images</p>
            <carousel>
                <slide v-for="(slide, index) in images" :key="index">
                    <img :src="slide.thumb" :alt="slide.instanceFilename"/>
                </slide>
            </carousel>
        </template>


    </modal>
</template>

<script>
    import {Modal, Carousel, Slide} from "uiv";
    import Username from "../User/Username";
    import UsernameList from "../User/UsernameList";

    export default {
        name: "ProjectInfoModal",
        components: {
            UsernameList,
            Username,
            Modal,
            Carousel,
            Slide
        },
        props: ['project', 'open'],
        data() {
            return {
                description: null,
                images: [],
                creators: [],
                admins: [],
                contributors: [],
                online: [],
                representatives: [],
            }
        },
        methods: {
            userById(id) {
                return this.contributors.find(c => {
                    return c.id === id;
                });
            },
            close() {
                this.$emit('update:open', false)
            }
        },
        watch: {
            project() {
                api.get(`api/domain/be.cytomine.project.Project/${this.project.id}/description.json`).then(response => {
                    this.description = response.data.data;
                }).catch(e => {
                    this.description = "";
                });

                api.get(`api/project/${this.project.id}/creator.json`).then(response => {
                    this.creators = response.data.collection;
                });

                api.get(`api/project/${this.project.id}/admin.json`).then(response => {
                    this.admins = response.data.collection;
                });

                api.get(`api/project/${this.project.id}/user.json`).then(response => {
                    this.contributors = response.data.collection;
                });

                api.get(`api/project/${this.project.id}/user.json?online=true`).then(response => {
                    this.online = response.data.collection;
                });

                api.get(`api/project/${this.project.id}/representative.json`).then(response => {
                    this.representatives = response.data.collection;
                });

                api.get(`api/project/${this.project.id}/imageinstance.json?max=3`).then(response => {
                    this.images = response.data.collection;
                })
            }
        },
    }
</script>

<style scoped>
    .milestone-counter {
        text-align: center;
    }

    .stat {
        margin: 10px auto;
    }

    .highlight {
        color: #111;
        padding: 20px 0;
        font-weight: bold;
        display: block;
        overflow: hidden;
        margin-bottom: 0;
        font-size: 36px;
        -ms-word-wrap: break-word;
        word-wrap: break-word;
    }

    .stat i {
        color: #3498db;
    }

    .milestone-details {
        font-weight: bold;
        font-size: 18px;
        color: #999;
    }
</style>
