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
                        You are in review mode.
                    </div>
                    There are {{nbVisibleAnnotations}} visible annotations.
                    Review them one by one with Select tool or
                    <div class="text-center">
                        <div class="btn-group">
                            <button class="btn btn-default btn-xs">
                                <i class="fas fa-check-double"></i> Accept all
                            </button>
                            <button class="btn btn-default btn-xs">
                                <i class="fas fa-minus"></i> Reject all
                            </button>
                        </div>
                    </div>
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

            <!--<div v-if="isSelected()">-->
                <!--<dl>-->
                    <!--<dt>Annotation:</dt>-->
                    <!--<dd>{{featureId}}</dd>-->
                    <!--<dt>User</dt>-->
                    <!--<dd>{{featureUser}}</dd>-->
                    <!--<dt>Created:</dt>-->
                    <!--<dd>{{featureDate}}</dd>-->
                    <!--<dt>Term(s):</dt>-->
                    <!--<dd></dd>-->
                <!--</dl>-->
                <!--<button class="btn btn-success" :disabled="this.featureSelectedData.reviewed" @click="acceptReview">-->
                    <!--Accept-->
                <!--</button>-->
                <!--<button class="btn btn-danger" :disabled="!this.featureSelectedData.reviewed" @click="rejectReview">-->
                    <!--Reject-->
                <!--</button>-->
            <!--</div>-->
        <!--</section>-->
        <!--<section>-->
            <!--<h4>Review | Action Image</h4>-->
            <!--<div class="btn-group">-->
                <!--<button class="btn btn-success" @click="acceptAll">Accept all</button>-->
                <!--<button class="btn btn-danger" @click="rejectAll">Reject all</button>-->
                <!--<button class="btn btn-success" v-if="!currentMap.data.reviewed" @click="validateImage">Validate Image-->
                <!--</button>-->
                <!--<button class="btn btn-danger" v-else @click="unvalidateImage">Unvalidate Image</button>-->
            <!--</div>-->
        </section>
    </div>
</template>

<script>
    import humanDate from '../../helpers/humanDate'
    import pointStyle from '../../helpers/pointStyle'
    import Username from "../User/Username";
    import DateItem from "../Datatable/DateItem";

    export default {
        name: 'Review',
        components: {DateItem, Username},
        props: [
            'image',
            'currentUser',
            'reviewMode',
            'reviewUser',
            'nbVisibleAnnotations',
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
            }
        },
        methods: {
            // isSelected() {
            //   return this.featureSelected != undefined;
            // },
            // displayName(userId) {
            //   let index = this.userLayers.findIndex(user => user.id == userId);
            //   return index < 0 ? "" : `${this.userLayers[index].lastname} ${this.userLayers[index].firstname} (${this.userLayers[index].username})`
            // },
            // acceptReview() {
            //   let id = this.featureSelectedData.parentIdent ? this.featureSelectedData.parentIdent : this.featureId;
            //   api.put(`/api/annotation/${id}/review.json`, {
            //     id:this.featureId,
            //     terms: this.featureSelectedData.term,
            //   }).then(data => {
            //     this.featureSelected.getStyle().getStroke().setColor([91, 183, 91]);
            //     let fillColor = this.featureSelected.getStyle().getFill().getColor();
            //     this.featureSelected.getStyle().setImage(pointStyle(fillColor, [91, 183, 91]))
            //     this.featureSelected.changed();
            //     this.$emit('featureSelectedData', data.data.reviewedannotation);
            //     this.$emit('updateLayers', true);
            //   })
            // },
            // acceptAll() {
            //   api.post(`/api/task.json?&project=${this.currentMap.data.project}`, {
            //     project: this.currentMap.data.project,
            //   }).then(data => {
            //     let task = data.data.task;
            //     api.put(`/api/imageinstance/${this.currentMap.imageId}/annotation/review.json?users=${this.currentMap.user.id}&task=${task.id}`, {
            //       image: this.currentMap.imageId,
            //       layers: this.layersSelected.map(layer => layer.id),
            //       task: task.id
            //     }).then(() => {
            //       this.$emit('updateLayers', true);
            //     })
            //   })
            // },
            // rejectReview() {
            //   let id = this.featureSelectedData.parentIdent;
            //   api.delete(`/api/annotation/${id}/review.json`).then(data => {
            //     this.featureSelected.getStyle().getStroke().setColor([189, 54, 47]);
            //     let fillColor = this.featureSelected.getStyle().getFill().getColor();
            //     this.featureSelected.getStyle().setImage(pointStyle(fillColor, [189, 54, 47]))
            //     this.featureSelected.changed();
            //     api.get(`/api/annotation/${id}.json`).then(data => {
            //       this.$emit('featureSelectedData', data.data);
            //       this.$emit('updateLayers', true);
            //     })
            //   })
            // },
            // rejectAll() {
            //   api.post(`/api/task.json?&project=${this.currentMap.data.project}`, {
            //     project: this.currentMap.data.project,
            //   }).then(data => {
            //     let task = data.data.task;
            //     api.delete(`/api/imageinstance/${this.currentMap.imageId}/annotation/review.json?users=${this.currentMap.user.id}&task=${task.id}`).then(() => {
            //       this.$emit('updateLayers', true);
            //     });
            //   })
            // },
            // validateImage() {
            //   api.delete(`/api/imageinstance/${this.currentMap.imageId}/review.json?cancel=false`).then(data => {
            //     this.$emit('updateMap', data.data.imageinstance);
            //   })
            // },
            // unvalidateImage() {
            //   api.delete(`/api/imageinstance/${this.currentMap.imageId}/review.json?cancel=true`).then(data => {
            //     this.$emit('updateMap', data.data.imageinstance);
            //   })
            // }
        }
    }
</script>

<style>

</style>
