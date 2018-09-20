<template>
    <modal v-model="openModal" @hide="close">
        <template slot="title">
            Similar annotations for annotation #{{annotation.id}}
        </template>
        <h4>Current selection</h4>

        <h4>Similarities</h4>
    </modal>
</template>

<script>
    import {Modal} from "uiv";

    export default {
        name: "AnnotationSimilaritiesModal",
        components: {
            Modal,
        },
        data() {
            return {
                openModal: this.open,

            }
        },
        props: ['open', 'annotation', 'project', 'currentUser', 'users'],
        computed: {

        },
        methods: {
            close() {
                this.$emit('update:open', false)
            },
        },
        watch: {
            open(newValue) {
                this.openModal = newValue;
            },
        },
    }
</script>

<style scoped>

</style>
