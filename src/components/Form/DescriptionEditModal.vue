<template>
    <modal v-model="open" :title="'Edit description for ' + domainName + ' ' + name" @hide="close" append-to-body>

    </modal>
</template>

<script>
    import Modal from "uiv/src/components/modal/Modal";

    export default {
        name: "DescriptionEditModal",
        components: {
            Modal
        },
        props: ['object', 'domainName', 'name', 'open'],
        data() {
            return {

            }
        },
        methods: {
            close() {
                this.$emit('update:open', false)
            }
        }
    }
</script>

<style scoped>

</style>
