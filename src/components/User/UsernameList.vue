<template>
    <span>
        <template v-for="(user, index) in users">
            <span :class="{ 'online-user': online && isOnline(user.id)}">
                <username :user="user"></username><span v-if="index+1 < users.length">, </span>
            </span>
        </template>
    </span>
</template>

<script>
    import Username from "./Username";

    export default {
        name: "UsernameList",
        components: {Username},
        props: ['users', 'online'],
        methods: {
            isOnline(id) {
                return this.online && this.online.find(o => {
                    return o.id === id
                })
            }
        }
    }
</script>

<style scoped>
    .online-user {
        color: green;
        font-weight: bold;
    }
</style>
