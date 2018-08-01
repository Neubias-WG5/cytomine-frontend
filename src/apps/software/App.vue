<template>
    <div>
        <tabs>
            <tab title="Software list">
                <p class="tab-content">
                    <software-list></software-list>
                </p>
            </tab>
            <tab title="A">
                <software-detail v-for="softwareTab in softwareTabs" :key="softwareTab" :softwareId="softwareTab"></software-detail>
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
                softwareTabs: [286],
                maxTabs: 6,
            }
        },
        computed: {


        },
        methods: {

        },
        created() {

        },
    }
</script>

<style>
    .tab-content {
        padding: 1em;
    }

</style>

