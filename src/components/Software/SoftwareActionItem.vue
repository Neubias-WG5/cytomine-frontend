<template>
    <btn-group>
        <button class="btn btn-xs" @click="addSoftwareTab(row)">
            <i class="fa fa-plus" aria-hidden="true"></i> Details
        </button>
    </btn-group>
</template>

<script>
    import {BtnGroup, Btn} from 'uiv'

    export default {
        name: "SoftwareActionItem",
        props: ['value', 'row', 'xprops'],
        components: {
            BtnGroup,
            Btn
        },
        methods: {
            addSoftwareTab(software) {
                this.xprops.eventbus.$emit('clickSoftwareDetails', software);
            }
        }
    }
</script>

<style scoped>

</style>
