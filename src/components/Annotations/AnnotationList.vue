<template>
    <ul class="annotations-container">
        <annotation v-for="annotation in annotations" :key="annotation.id + uuid()"
                    :annotation="annotation" :is-reviewing="isReviewing">
        </annotation>
        <div v-if="annotations && annotations.length == 0" class="alert alert-info mt-4">
            No annotation
        </div>
    </ul>
</template>

<script>
    import uuid from 'uuid'
    import Annotation from "./Annotation"

    export default {
        name: "AnnotationList",
        components: [
            Annotation
        ],
        props: [
            'annotations',
            'isReviewing'
        ],
        methods: {
            uuid
        }
    }
</script>

<style scoped>
    .annotations-container {
        display: flex;
        list-style: none;
        flex-wrap: wrap;
        padding: 0;
        margin-top: 1em;
    }
</style>
