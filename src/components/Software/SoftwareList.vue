<template>
    <div>
        <datatable v-bind="$data" ></datatable>
    </div>
</template>

<script>
    import DateItem from '../Datatable/DateItem'
    import BooleanItem from '../Datatable/BooleanItem'
    import SoftwareStatItem from './SoftwareStatItem'
    import SoftwareDeprecatedItem from './SoftwareDeprecatedItem'
    import SoftwareNameItem from './SoftwareNameItem'
    import SoftwareActionItem from './SoftwareActionItem'

    export default {
        name: "SoftwareList",
        components: {
            DateItem,
            BooleanItem,
            SoftwareStatItem,
            SoftwareDeprecatedItem,
            SoftwareNameItem,
            SoftwareActionItem
        },
        data() {
            return {
                columns: [
                    { title: 'ID', field: 'id', group: 'General', sortable: true },
                    { title: 'Name', field: 'name', group: 'General', sortable: true, visible: 'true', tdComp: 'SoftwareNameItem' },
                    { title: 'Version', field: 'softwareVersion', group: 'General', sortable: true },
                    { title: 'Status', field: 'deprecated', group: 'General', sortable: true, tdComp: 'SoftwareDeprecatedItem' },
                    { title: 'Executable', field: 'executable', group: 'General', sortable: true, tdComp: 'BooleanItem' },
                    { title: '# Jobs', field: 'numberOfJob', group: 'Statistics', tdComp: 'SoftwareStatItem'},
                    { title: '# In queue', field: 'numberOfInQueue', group: 'Statistics', tdComp: 'SoftwareStatItem', visible: false},
                    { title: '# Running', field: 'numberOfRunning', group: 'Statistics', tdComp: 'SoftwareStatItem', visible: false},
                    { title: '# Successful', field: 'numberOfSuccess', group: 'Statistics', tdComp: 'SoftwareStatItem', visible: false},
                    { title: '# Failed', field: 'numberOfFailed', group: 'Statistics', tdComp: 'SoftwareStatItem', visible: false},
                    { title: '# Killed', field: 'numberOfKilled', group: 'Statistics', tdComp: 'SoftwareStatItem', visible: false},
                    { title: 'Creation date', field: 'created', group: 'General', tdComp: 'DateItem'},
                    { title: 'Action(s)', group: 'General', visible: 'true', tdComp: 'SoftwareActionItem'}
                ],
                data: [],
                total: 0,
                query: {}

            }
        },
        watch: {
            query: {
                handler (query) {
                    api.get(`api/software.json?max=${query.limit}&offset=${query.offset}`).then(response => {
                        this.data = response.data.collection;
                        this.total = response.data.size;
                    });
                },
                deep: true
            }
        }
    }
</script>

<style scoped>

</style>
