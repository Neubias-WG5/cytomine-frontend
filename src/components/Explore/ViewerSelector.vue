<template>
    <div class="form-inline" v-if="nbViewers < nbMaxViewers">
        <div class="form-group">
            <label for="images" class="sr-only">Image</label>
            <select class="form-control" v-model="selectedImage" name="images" id="images" title="Add image in a new viewer">
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
        </div>

        <button class="btn btn-default" @click="addViewer">Add a viewer</button>
    </div>
    <p v-else>You can only have {{nbMaxViewers}} views displayed in an explorer tab.</p>
</template>

<script>
    export default {
        name: 'ViewerSelector',
        props: ['project', 'nbViewers', 'nbMaxViewers', 'images'],
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
    .form-inline {
        padding: 3px;
    }
</style>
