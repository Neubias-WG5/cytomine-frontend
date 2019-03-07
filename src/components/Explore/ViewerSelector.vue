<template>
    <div class="btn-group" style="display:flex;" v-if="nbViewers < nbMaxViewers">
        <select class="btn btn-default" v-model="selectedImage" name="images" id="images"
                title="Add image in a new viewer">
            <option value="">Select an image to add</option>
            <option v-for="image in selectableImages" :key="image.id" :value="image.id">
                <template v-if="project.blindMode">
                    [BLIND] {{image.id}}
                </template>
                <template v-else>
                    {{image.name}}
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
            'images',
            'imageGroups'
        ],
        data() {
            return {
                selectedImage: ''
            }
        },
        computed: {
            selectableImages() {
                let images = [];
                if (this.imageGroups.length > 0) {
                    this.imageGroups.forEach(imageGroup => {
                        images.push({
                            'id': imageGroup.referenceSequence.image,
                            'name': imageGroup.name
                        })
                    })
                }
                else {
                    this.images.forEach(image => {
                        images.push({
                            'id': image.id,
                            'name': image.instanceFilename
                        })
                    })
                }
                return images.sort((a, b) => {
                    return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
                })
            }
        },
        methods: {
            addViewer() {
                this.$emit('add-viewer', this.selectedImage)
            }
        },
    }
</script>

<style scoped>
    .btn-group {
        padding: 3px;
    }
</style>
