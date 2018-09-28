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
        </section>
    </div>
</template>

<script>
    import Username from "../../User/Username";
    import DateItem from "../../Datatable/DateItem";

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
        }
    }
</script>

<style>

</style>
