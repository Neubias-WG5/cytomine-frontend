<template>
    <div>
        <section>
            <h4><i class="fas fa-check-circle"></i> Review</h4>

            <div v-if="isNotReviewed">
                This image has not been reviewed.
                <div class="text-center">
                    <button class="btn btn-default" @click="$emit('changeReviewStatus', 'start')">
                        <i class="fas fa-play-circle"></i> Start reviewing
                    </button>
                </div>
            </div>
            <div v-else-if="image.inReview">
                <div v-if="isInReviewByMe && !reviewMode">
                    <div class="alert alert-warning">
                        You (<username :user="currentUser"></username>) are reviewing this image
                        since <date-item :value="image.reviewStart"></date-item>.
                    </div>
                    <div class="text-center">
                        <button class="btn btn-default" @click="$emit('update:reviewMode', !reviewMode)">
                            <i class="fas fa-play-circle"></i> Continue reviewing
                        </button>
                    </div>
                </div>
                <div v-else-if="isInReviewByMe && reviewMode">
                    <div class="alert alert-info">
                        You are in review mode. <br>
                        {{reviewLayer.size}} annotations already reviewed.
                    </div>
                    <template v-if="nbVisibleAnnotations > 0">
                        The layers of <username-list :users="visibleUserLayers"></username-list> are currently
                        displayed (in total: {{nbVisibleAnnotations}} annotations).<br>
                        <div v-if="!taskReviewAll">
                            Review them one by one with Select tool or
                            <div class="text-center">
                                <div class="btn-group">
                                    <button class="btn btn-success btn-xs" @click="acceptAll">
                                        <i class="fas fa-check-double"></i> Accept all
                                    </button>
                                    <button class="btn btn-danger btn-xs" @click="rejectAll">
                                        <i class="fas fa-minus"></i> Reject all
                                    </button>
                                </div>
                            </div>
                        </div>
                        <task :task.sync="taskReviewAll" :timeout="2000"></task>

                    </template>

                    <hr/>
                    <div class="text-center">
                        <div class="btn-group-vertical">
                            <button class="btn btn-warning" @click="$emit('update:reviewMode', !reviewMode)">
                                <i class="fas fa-pause-circle"></i> Continue my review later
                            </button>
                            <button class="btn btn-danger" @click="$emit('changeReviewStatus', 'cancel')">
                                <i class="fas fa-times"></i> Cancel my review
                            </button>
                            <button class="btn btn-success" @click="$emit('changeReviewStatus', 'validate')">
                                <i class="fas fa-thumbs-up"></i> Validate my review
                            </button>
                        </div>
                    </div>
                </div>
                <div class="alert alert-danger" v-else>
                    This image is currently in review by <username :user="reviewUser"></username>
                    since <date-item :value="image.reviewStart"></date-item>.
                </div>
            </div>
            <div v-else>
                <div v-if="isValidatedByMe">
                    <div class="alert alert-success">
                        <p>You (<username :user="currentUser"></username>) have validated this image
                            on <date-item :value="image.reviewStop"></date-item>.</p>
                    </div>
                    <div class="text-center">
                        <button class="btn btn-default" @click="$emit('changeReviewStatus', 'unvalidate')">
                            <i class="fas fa-thumbs-down"></i> Unvalidate and continue my review
                        </button>
                    </div>
                </div>
                <div v-else>
                    <div class="alert alert-success">
                        This image has been validated by <username :user="reviewUser"></username>
                        on <date-item :value="this.image.reviewStop"></date-item>.
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
    import Username from "../../User/Username";
    import DateItem from "../../Datatable/DateItem";
    import UsernameList from "../../User/UsernameList";
    import Task from "../../Task"

    export default {
        name: 'Review',
        components: {UsernameList, DateItem, Username, Task},
        data() {
            return {
                taskReviewAll: null,
            }
        },
        props: [
            'project',
            'image',
            'currentUser',
            'reviewMode',
            'reviewUser',
            'userLayers',
            'users'
        ],
        computed: {
            isNotReviewed() {
                return !this.image.inReview && !this.image.reviewed;
            },
            isInReviewByMe() {
                return this.image.inReview && this.image.reviewUser == this.currentUser.id;
            },
            isValidatedByMe() {
                return this.image.reviewed && this.image.reviewUser == this.currentUser.id;
            },
            visibleUserLayers() {
                return this.userLayers.filter(userLayer => userLayer.selected && userLayer.visible && !userLayer.review);
            },
            visibleUserLayerIds() {
                return this.visibleUserLayers.map(layer => layer.id);
            },
            nbVisibleAnnotations() {
                let sum = 0;
                this.visibleUserLayers.forEach(layer => sum += layer.size);
                return sum;
            },
            reviewLayer() {
                return this.userLayers.find(l => l.id == -100)
            },
        },
        methods: {
            acceptAll() {
                api.post(`api/task.json.project=${this.project.id}`, {}).then(response => {
                    this.taskReviewAll = response.data.task;
                    api.post(`api/imageinstance/${this.image.id}/annotation/review.json?users=${this.visibleUserLayerIds.join(',')}&task=${this.taskReviewAll.id}`, {}).then(response => {
                        this.taskReviewAll = null;
                        this.$emit('updateAnnotationIndexes');
                        this.visibleUserLayerIds.forEach(id => this.$emit('forceUpdateLayer', id));
                        this.$notify({
                            placement: 'bottom-right',
                            type: 'success',
                            content: response.data.message
                        });
                    }).catch(error => {
                        this.$notify({
                            placement: 'bottom-right',
                            type: 'danger',
                            content: error.response.data.errors
                        });
                    })
                })
            },
            rejectAll() {
                api.post(`api/task.json.project=${this.project.id}`, {}).then(response => {
                    this.taskReviewAll = response.data.task;
                    api.delete(`api/imageinstance/${this.image.id}/annotation/review.json?users=${this.visibleUserLayerIds.join(',')}&task=${this.taskReviewAll.id}`, {}).then(response => {
                        this.taskReviewAll = null;
                        this.$emit('updateAnnotationIndexes');
                        this.visibleUserLayerIds.forEach(id => this.$emit('forceUpdateLayer', id));
                        this.$notify({
                            placement: 'bottom-right',
                            type: 'success',
                            content: response.data.message
                        });
                    }).catch(error => {
                        this.$notify({
                            placement: 'bottom-right',
                            type: 'danger',
                            content: error.response.data.errors
                        });
                    })
                })
            }
        }
    }
</script>

<style>

</style>
