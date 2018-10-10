<template>
    <span v-if="user" :class="{'online-user': online}">
        <span v-if="!user.algo">{{user.firstname}} {{user.lastname}} ({{user.username}})</span>
        <span v-else>{{user.softwareName}} ({{user.username}})</span>
    </span>
</template>

<script>
    export default {
        name: "Username",
        props: [
            'user',
            'online'
        ]
    }
</script>

<style scoped>
    .online-user {
        color: green;
        font-weight: bold;
    }
</style>
