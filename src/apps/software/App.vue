<template>
    <div>
        <tabs v-model="tabIndex">
            <tab title="Software list">
                <p class="tab-content">
                    <software-list @addSoftwareTab="goToSoftwareTab"></software-list>
                </p>
            </tab>
            <tab v-for="software in softwareTabs" :key="software.id" :title="software.fullName">
                <button class="btn pull-right" @click="removeSoftwareTab(software)">Close</button>
                <software-detail :software="software" :softwareUserRepositories="softwareUserRepositories"
                :parameterConstraints="parameterConstraints"></software-detail>
            </tab>

        </tabs>
    </div>

</template>

<script>
    import {Tabs, Tab} from 'uiv'
    import SoftwareList from "../../components/Software/SoftwareList";
    import SoftwareDetail from "../../components/Software/SoftwareDetail"

    export default {
        name: 'app-software',
        components: {
            SoftwareList,
            SoftwareDetail,
            Tabs,
            Tab
        },
        data() {
            return {
                softwareTabs: [],
                maxTabs: 6,
                tabIndex: 0,
                softwareUserRepositories: [],
                parameterConstraints: [],
            }
        },
        computed: {


        },
        methods: {
            goToSoftwareTab(software) {
                let index = this.softwareTabs.findIndex(s => {
                    return s.id === software.id;
                });

                if (index != -1)
                    this.tabIndex = index + 1;
                else
                    this.addSoftwareTab(software);
            },
            addSoftwareTab(software) {
                this.softwareTabs.push(software);
                this.softwareTabs.splice(0, this.softwareTabs.length - this.maxTabs);
                this.tabIndex = this.softwareTabs.length;
            },
            removeSoftwareTab(software) {
                let index = this.softwareTabs.findIndex(s => {
                    return s.id === software.id;
                });
                this.softwareTabs.splice(index, 1);
                this.tabIndex = this.softwareTabs.length
            },
            checkRoute() {
                // DEPENDS ON [BACKBONE]
                this.currentRoute = Backbone.history.getFragment();
            },
        },
        created() {
            api.get(`api/software_user_repository.json`).then(response => {
                this.softwareUserRepositories = response.data.collection;
            });

            api.get(`api/parameter_constraint.json`).then(response => {
                this.parameterConstraints = response.data.collection;
            });

            // DEPENDS ON [BACKBONE]
            setInterval(this.checkRoute, 1000)
        },
    }
</script>

<style>
    .tab-content {
        padding: 1em;
        padding-top: 40px;
    }

    .nav-tabs {
        position: fixed;
        z-index: 1000;
        width: 100%;
        background-color: white;
    }

</style>

