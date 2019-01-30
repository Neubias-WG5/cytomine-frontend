<template>
    <span>
        <span v-if="!row.softwareVersion">
            <span class="label label-default">
                No info
            </span>
        </span>
        <span v-else-if="value">
            <span class="label label-default">
                Deprecated
            </span>
        </span>
            <span v-else>
            <span class="label label-primary">
                Last release
            </span>
        </span>
    </span>

</template>

<script>
    export default {
        name: "SoftwareDeprecatedItem",
        props: ['value', 'row']
    }
</script>

<style scoped>

</style>
