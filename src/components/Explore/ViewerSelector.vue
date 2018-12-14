<template>
    <div class="btn-group" style="display:flex;" v-if="nbViewers < nbMaxViewers">
        <select class="btn btn-default" v-model="selectedImage" name="images" id="images"
                title="Add image in a new viewer">
            <option value="">Select an image to add</option>
            <option v-for="image in images" :key="image.id" :value="image.id">
                <template v-if="project.blindMode">
                    [BLIND] {{image.id}}
                </template>
                <template v-else>
                    {{image.instanceFilename}}
                </template>
            </option>
        </select>

        <button class="btn btn-default" @click="addViewer">Add a viewer</button>
    </div>
    <p v-else>You can only have {{nbMaxViewers}} views displayed in an explorer tab.</p>
</template>

<script>
    export default {
        name: 'ViewerSelector',
        props: [
            'project',
            'nbViewers',
            'nbMaxViewers',
            'images'
        ],
        data() {
            return {
                selectedImage: ''
            }
        },
        methods: {
            addViewer() {
                this.$emit('add-viewer', this.selectedImage)
            }
        }
    }
</script>

<style scoped>
    .btn-group {
        padding: 3px;
    }
</style>
