<template>
    <div>{{ row.name }}
        <template v-if="row.softwareVersion">
            ({{ row.softwareVersion }})
        </template>
    </div>
</template>

<script>
    export default {
        name: "SoftwareNameItem",
        props: ['value', 'row'],
    }
</script>

<style scoped>

</style>
