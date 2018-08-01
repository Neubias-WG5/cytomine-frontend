<template>
    <div>
        <span v-if="value">
            <span class="label label-default">
                Deprecated
            </span>
        </span>
            <span v-else>
            <span class="label label-primary">
                Last release
            </span>
        </span>
    </div>

</template>

<script>
    export default {
        name: "SoftwareDeprecatedItem",
        props: ['value']
    }
</script>

<style scoped>

</style>
