<template>
    <div>
        <div v-if="visible" class="cytomine-container">
            <div class="button-center">
                <button class="btn btn-primary" @click="refreshRepositories()">
                    <i class="fas fa-sync-alt"></i> Refresh software from trusted sources
                </button>
                <button class="btn btn-primary" @click="openModal=true">
                    <i class="fas fa-plus" aria-hidden="true"></i> Add trusted source
                </button>
            </div>

            <h3 class="header_h">
                Trusted sources
            </h3>
            <table class="table table-striped table-bordered">
                <thead>
                <tr>
                    <th>#</th>
                    <th>Source</th>
                    <th>Creation date</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="repo in softwareRepositories" :key="repo.id">
                    <td>{{repo.id}}</td>
                    <td>
                        <software-repository-name :software-repository="repo"></software-repository-name>
                    </td>
                    <td><date-item :value="repo.created"></date-item></td>
                </tr>
                <tr v-if="softwareRepositories.length == 0">
                    <td colspan="8" class="text-center">No trusted sources.</td>
                </tr>
                </tbody>
            </table>


        </div>
        <modal v-model="openModal" title="Add a new trusted source" @hide="close">
            <form class="form-horizontal">
                <div class="form-group">
                    <label for="provider" class="col-sm-3 control-label">Source code provider</label>
                    <div class="col-sm-9">
                        <select class="form-control" id="provider">
                            <option>Github</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="username-provider" class="col-sm-3 control-label">Source code username</label>
                    <div class="col-sm-9">
                        <input v-model="localData.username" type="text" class="form-control" id="username-provider" placeholder="">
                    </div>
                </div>
                <div class="form-group">
                    <label for="container-provider" class="col-sm-3 control-label">Environment provider</label>
                    <div class="col-sm-9">
                        <select class="form-control" id="container-provider">
                            <option>DockerHub</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="username-container-provider" class="col-sm-3 control-label">Environment username</label>
                    <div class="col-sm-9">
                        <input v-model="localData.dockerUsername" type="text" class="form-control" id="username-container-provider" placeholder="">
                    </div>
                </div>
                <div class="form-group">
                    <label for="prefix" class="col-sm-3 control-label">Prefix</label>
                    <div class="col-sm-9">
                        <input v-model="localData.prefix" type="text" class="form-control" id="prefix" placeholder="Optional">
                    </div>
                </div>
            </form>

            <div slot="footer">
                <btn @click="close">Cancel</btn>
                <btn type="success" @click="tryToAdd">Add</btn>
            </div>
        </modal>
    </div>

</template>

<script>
    import SoftwareRepositoryName from "./SoftwareUserRepository/SoftwareRepositoryName";
    import DateItem from "../Datatable/DateItem";
    import {Modal} from 'uiv';
    export default {
        name: "SoftwareAdmin",
        components: {DateItem, SoftwareRepositoryName, Modal},
        data() {
            return {
                isAdmin: false,
                softwareRepositories: [],
                currentRoute: '',
                openModal: false,
                localData: {
                    provider: 'github',
                    username: '',
                    dockerUsername: '',
                    prefix: ''
                }
            }
        },
        computed: {
            visible() {
                return this.isAdmin
            }
        },
        methods: {
            checkAdmin() {
                // DEPENDS ON [BACKBONE]
                this.isAdmin = window.app.status.user.model.get("adminByNow");
            },
            checkRoute() {
                // DEPENDS ON [BACKBONE]
                this.currentRoute = Backbone.history.getFragment();
            },
            refreshRepositories() {
                api.get(`/api/software_user_repository/refresh_user_repositories.json`).then(response => {
                    this.$notify({
                        placement: 'bottom-right',
                        type: 'success',
                        content: response.data.message
                    });
                })
            },
            tryToAdd() {
                api.post(`api/software_user_repository.json`, this.localData).then(response => {
                    this.$notify({
                        placement: 'bottom-right',
                        type: 'success',
                        content: response.data.message
                    });
                    api.get(`/api/software_user_repository.json`).then(response => {
                        this.softwareRepositories = response.data.collection;
                    });
                    this.close();
                }).catch(error => {
                    this.$notify({
                        placement: 'bottom-right',
                        type: 'danger',
                        content: error.response.data.errors
                    });
                })
            },
            close() {
                this.openModal = false
            }
        },
        created() {
            setInterval(this.checkAdmin.bind(this), 1000);
            setInterval(this.checkRoute.bind(this), 1000)
        },
        mounted() {
            api.get(`/api/software_user_repository.json`).then(response => {
                this.softwareRepositories = response.data.collection;
            })
        }
    }
</script>

<style scoped>
    .cytomine-container {
        width: 90%;
        margin: auto;
    }

    .button-center {
        text-align: center;
        margin: 5px;
    }
</style>
