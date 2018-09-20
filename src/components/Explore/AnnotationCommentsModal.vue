<template>
    <modal v-model="openModal" @hide="close">
        <template slot="title">
            Comments for annotation #{{annotation.id}}
            <span class="label label-info"><i class="fas fa-comments"></i> {{nbComments}}</span>
        </template>

        <div class="row">
            <div class="col-sm-12">
                <div class="panel panel-default" v-for="comment in comments">
                    <div :class="['panel-heading', {'panel-heading-left': comment.sender != currentUser.id},
                    {'panel-heading-right': comment.sender == currentUser.id}]">
                        <i class="fas fa-comment"></i>
                        <strong>
                            <username :user="userById(comment.sender)"></username>
                        </strong>
                        -
                        <span class="text-muted"><date-item :value="comment.created"></date-item></span>
                    </div>
                    <div class="panel-body">
                        {{comment.comment}}
                    </div>
                </div>
            </div>
        </div>
        <div slot="footer">
            <div class="send-form">
                <div class="radio">
                    <label>
                        <input type="radio" name="sendType" id="sendType1" value="all" v-model="sendType">
                        Send to all project contributors
                    </label>
                </div>
                <div class="radio">
                    <label>
                        <input type="radio" name="sendType" id="sendType2" value="some" v-model="sendType">
                        Send to some project contributors only
                    </label>
                </div>
                <voerro-tags-input placeholder="Add a username" input-class="form-control"
                                   v-model="sendUsers" :typeahead="true" :typeahead-max-results="15"
                                   :only-existing-tags="true" :existing-tags="typeaheadUsers"
                                   v-if="sendType == 'some'"></voerro-tags-input>
                <div class="radio">
                    <label>
                        <input type="radio" name="sendType" id="sendType3" value="email" v-model="sendType">
                        Send by email
                    </label>
                </div>
                <voerro-tags-input placeholder="Add an email address" input-class="form-control" v-model="sendEmails"
                                   v-if="sendType == 'email'" style="margin-bottom: 5px;"></voerro-tags-input>

                <textarea placeholder="Comment" v-model="sendText"></textarea>
                <div style="text-align: right">
                    <button type="submit" class="btn btn-success" @click="sendComment" :disabled="sendingSpinner">
                        <template v-if="sendingSpinner">
                            <i class="fas fa-spinner fa-spin"></i> Sending ...
                        </template>
                        <template v-else>
                            <i class="fas fa-share"></i> Share
                        </template>
                    </button>
                </div>

            </div>
        </div>
    </modal>
</template>

<script>
    import {Modal} from "uiv";
    import VoerroTagsInput from '@voerro/vue-tagsinput';
    import '@voerro/vue-tagsinput/dist/style.css';
    import DateItem from "../Datatable/DateItem";
    import Username from "../User/Username";

    export default {
        name: "AnnotationCommentsModal",
        components: {
            Username,
            DateItem,
            Modal,
            VoerroTagsInput
        },
        data() {
            return {
                openModal: this.open,
                nbComments: 0,
                comments: [],
                sendType: 'all',
                sendEmails: [],
                sendUsers: [],
                sendText: '',
                sendingSpinner: false,
            }
        },
        props: ['open', 'annotation', 'project', 'currentUser', 'users'],
        computed: {
            typeaheadUsers() {
                let list = {};
                this.project.users.forEach(user => {
                    list[user.id] = `${user.firstname} ${user.lastname} (${user.username})`
                });
                return list;
            },
            annotationType() {
                return this.annotation.class.split(".").pop().toLowerCase();
            }
        },
        methods: {
            close() {
                this.$emit('update:open', false)
            },
            loadComments() {
                api.get(`api/${this.annotationType}/${this.annotation.id}/comment.json`).then(response => {
                    this.comments = response.data.collection;
                    this.nbComments = response.data.size;
                    this.$emit('updateNbComments', this.nbComments)
                })
            },
            sendComment() {
                this.sendingSpinner = true;

                if (this.sendType == 'all') {
                    this.sendUsers = Object.keys(this.typeaheadUsers)
                }

                api.post(`api/${this.annotationType}/${this.annotation.id}/comment.json`, {
                    annotation: this.annotation.id,
                    annotationClassName: this.annotation.class,
                    receivers: this.sendUsers,
                    emails: this.sendEmails,
                    comment: this.sendText,
                    subject: `Cytomine: ${this.currentUser.firstname} ${this.currentUser.lastname} (${this.currentUser.username}) shared an annotation with you`
                }).then(response => {
                    console.log(response.data.message);
                    // this.$notify({
                    //     placement: 'bottom-right',
                    //     type: 'success',
                    //     content: response.data.message
                    // })
                    this.sendEmails = [];
                    this.sendUsers = [];
                    this.sendText = '';
                    this.sendingSpinner = false;
                    this.loadComments();

                }).catch(error => {
                    console.log(error.response.data.errors);
                    // this.$notify({
                    //     placement: 'bottom-right',
                    //     type: 'danger',
                    //     content: error.response.data.errors
                    // })
                    this.sendingSpinner = false;
                })
            },
            userById(userId) {
                return this.users.find(user => user.id === userId);
            },
        },
        watch: {
            open(newValue) {
                this.openModal = newValue;
                this.loadComments();
            },
            sendType() {
                this.sendEmails = [];
                this.sendUsers = [];
            }
        },
        mounted() {
            this.loadComments();
        }
    }
</script>

<style scoped>
    .send-form {
        text-align: left;
    }

    .send-form textarea {
        background: none repeat scroll 0 0 #fff;
        border-radius: 4px 4px 0 0;
        height: 60px;
        padding: 10px;
        width: 100%;
        resize: vertical;
    }

    .send-form button {
        margin-top: 5px;
    }

    .panel {
        position: relative;
    }

    .panel > .panel-heading:after, .panel > .panel-heading:before {
        position: absolute;
        top: 11px;
        width: 0;
        height: 0;
        display: block;
        content: " ";
        border-color: transparent;
        border-style: solid solid outset;
        pointer-events: none;
    }

    .panel > .panel-heading:after {
        border-width: 7px;
        margin-top: 1px;
    }

    .panel > .panel-heading:before {
        border-width: 8px;
    }

    .panel > .panel-heading-left:after, .panel > .panel-heading-left:before {
        left: -16px;
        right: 100%;
    }

    .panel > .panel-heading-left:before {
        border-right-color: #ddd;
    }

    .panel > .panel-heading-left:after {
        border-right-color: #f7f7f7;
        margin-left: 2px;
    }

    .panel > .panel-heading-right:after, .panel > .panel-heading-right:before {
        right: -16px;
        left: 100%;
    }

    .panel > .panel-heading-right:before {
        border-left-color: #ddd;
    }

    .panel > .panel-heading-right:after {
        border-left-color: #f7f7f7;
        margin-right: 2px;
    }
</style>
