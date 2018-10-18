<template>
    <div v-if="visible" class="cytomine-container">
        <div class="button-center">
            <button class="btn btn-primary" @click="refreshRepositories()"><i class="fas fa-sync-alt"></i> Refresh software from trusted sources</button>
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

        <ul>

        </ul>
    </div>
    
</template>

<script>
    import SoftwareRepositoryName from "./SoftwareUserRepository/SoftwareRepositoryName";
    import DateItem from "../Datatable/DateItem";
    export default {
        name: "SoftwareAdmin",
        components: {DateItem, SoftwareRepositoryName},
        data() {
            return {
                isAdmin: false,
                softwareRepositories: [],
                currentRoute: ''
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
