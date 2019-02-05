<template>
    <div>
        <datatable v-bind="$data">
            <div class="form-inline">
                <div class="pull-right form-search">
                    <div class="form-group">
                        <label class="sr-only">Search</label>
                        <input type="text" class="form-control" placeholder="Search..." v-model="search">
                    </div>
                </div>

                <label class="checkbox-inline">
                    <input type="checkbox" v-model="showOnlyLastReleases"> Only last releases
                </label>
                <label class="checkbox-inline">
                    <input type="checkbox" v-model="showExecutable"> Only executables
                </label>
            </div>


        </datatable>
    </div>
</template>

<script>
    import Vue from 'vue'
    import DateItem from '../Datatable/DateItem'
    import BooleanItem from '../Datatable/BooleanItem'
    import SoftwareStatItem from './SoftwareStatItem'
    import SoftwareDeprecatedItem from './SoftwareDeprecatedItem'
    import SoftwareActionItem from './SoftwareActionItem'

    export default {
        name: "SoftwareList",
        components: {
            DateItem,
            BooleanItem,
            SoftwareStatItem,
            SoftwareDeprecatedItem,
            SoftwareActionItem
        },
        props: ['refresh', 'isAdmin'],
        data() {
            return {
                columns: [
                    { title: 'ID', field: 'id', group: 'General', sortable: true },
                    { title: 'Full name', field: 'fullName', group: 'General',sortable: true, visible: 'true'},
                    { title: 'Version', field: 'softwareVersion', group: 'General',sortable: true },
                    { title: 'Status', field: 'deprecated', group: 'General', sortable: true, tdComp: 'SoftwareDeprecatedItem' },
                    { title: 'Executable', field: 'executable', group: 'General',/*sortable: true,*/ tdComp: 'BooleanItem' },
                    { title: '# Jobs', field: 'numberOfJob', group: 'Statistics', tdComp: 'SoftwareStatItem'},
                    { title: '# In queue', field: 'numberOfInQueue', group: 'Statistics', tdComp: 'SoftwareStatItem', visible: false},
                    { title: '# Running', field: 'numberOfRunning', group: 'Statistics', tdComp: 'SoftwareStatItem', visible: false},
                    { title: '# Successful', field: 'numberOfSuccess', group: 'Statistics', tdComp: 'SoftwareStatItem', visible: false},
                    { title: '# Failed', field: 'numberOfFailed', group: 'Statistics', tdComp: 'SoftwareStatItem', visible: false},
                    { title: '# Killed', field: 'numberOfKilled', group: 'Statistics', tdComp: 'SoftwareStatItem', visible: false},
                    { title: 'Creation date', field: 'created', group: 'General', sortable: true, tdComp: 'DateItem'},
                    { title: 'Action(s)', group: 'General', visible: 'true', tdComp: 'SoftwareActionItem'}
                ],
                data: [],
                total: 0,
                xprops: {
                    eventbus: new Vue() // only for the current Datatable instance
                },
                query: {},
                showExecutable: true,
                showOnlyLastReleases: false,
                search: ""
            }
        },
        watch: {
            query: {
                handler (query) {
                    this.callAPI(query)
                },
                deep: true
            },
            refresh(newValue) {
                if (newValue) {
                    this.callAPI(this.query);
                    this.$emit('update:refresh', false);
                }
            },
            showExecutable(value) {
                this.query.offset = 0;
                this.$set(this.query, 'showExecutable', value)
            },
            search(value) {
                this.query.offset = 0;
                this.$set(this.query, 'search', value)
            },
            showOnlyLastReleases(value) {
                this.query.offset = 0;
                this.$set(this.query, 'showOnlyLastReleases', value)
            }
        },
        methods: {
            callAPI(query) {
                let executableOnly = (query.showExecutable) ? '&executableOnly=true' : '';
                let lastReleaseOnly = (query.showOnlyLastReleases) ? '&lastReleaseOnly=true' : '';
                let search= (query.search && query != "") ? `&search=${query.search}` : '';
                api.get(`api/software.json?max=${query.limit}&offset=${query.offset}&sort=${query.sort}&order=${query.order}${executableOnly}${lastReleaseOnly}${search}`).then(response => {
                    this.data = response.data.collection;
                    this.total = response.data.size;
                });
            }
        },
        created () {
            this.xprops.eventbus.$on('clickSoftwareDetails', (payload) => { this.$emit('addSoftwareTab', payload)})
            this.$set(this.query, 'showExecutable', this.showExecutable);
            this.$set(this.query, 'showOnlyLastReleases', this.showOnlyLastReleases)
        },
    }
</script>

<style scoped>
    .form-search {
        margin-right: 0.5em;
    }
</style>
