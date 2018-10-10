<template>
    <span>
        <template v-for="(user, index) in users">
            <username :user="user" :online="online && isOnline(user.id)"></username><span v-if="index+1 < users.length">, </span>
        </template>
    </span>
</template>

<script>
    import Username from "./Username";

    export default {
        name: "UsernameList",
        components: {Username},
        props: [
            'users',
            'online'
        ],
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

</style>
