<template>
    <span v-if="user">
        <span v-if="!user.algo">{{user.firstname}} {{user.lastname}} ({{user.username}})</span>
        <span v-else>{{user.softwareName}} ({{user.username}})</span>
    </span>
</template>

<script>
    export default {
        name: "Username",
        props: ['user']
    }
</script>

<style scoped>

</style>
