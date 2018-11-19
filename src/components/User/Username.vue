<template>
    <span v-if="user" :class="{'online-user': online}">
        <span v-if="!user.algo">{{user.firstname}} {{user.lastname}} ({{user.username}})</span>
        <span v-else><a style="color: inherit;" :href="'#tabs-useralgo-'+user.id">{{user.softwareName}} ({{user.username}})</a></span>
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
