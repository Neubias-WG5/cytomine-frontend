<template>
    <!--<tab :title="fullName">-->
    <div>
        <h1>{{ fullName }}</h1>
        {{ software }}

        <h1>Parameters</h1>
    </div>
    <!--</tab>-->

</template>

<script>
    import {Tab} from 'uiv'

    export default {
        name: "SoftwareDetail",
        components: {
            Tab
        },
        props: [
            'softwareId'
        ],
        data() {
            return {
                software: {}
            }
        },
        computed: {
            fullName() {
                let v = (this.software.softwareVersion) ? ` (${this.software.softwareVersion})` : '';
                return `${this.software.name} ${v}`;
            }
        },
        mounted() {
            api.get(`api/software/${this.softwareId}.json`).then(response => {
                this.software = response.data;
            })
        }
    }
</script>

<style scoped>

</style>
