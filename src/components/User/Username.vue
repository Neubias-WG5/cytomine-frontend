<template>
    <span v-if="user">{{user.firstname}} {{user.lastname}} ({{user.username}})</span>
</template>

<script>
    export default {
        name: "Username",
        props: ['user']
    }
</script>

<style scoped>

</style>
