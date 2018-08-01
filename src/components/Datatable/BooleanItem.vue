<template>
    <span v-if="value">
        <span class="label label-success">
            <span class="glyphicon glyphicon-ok" aria-hidden="true"></span>
            Yes
        </span>
    </span>
    <span v-else>
        <span class="label label-danger">
            <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
            No
        </span>
    </span>
</template>

<script>
    export default {
        name: "BooleanItem",
        props: ['value']
    }
</script>

<style scoped>

</style>
