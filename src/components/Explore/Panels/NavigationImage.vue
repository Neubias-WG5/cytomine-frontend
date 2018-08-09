<template>
    <div class="text-center">
        <div class="btn-group">
            <div class="alert alert-warning" v-if="adjacentImageError != ''"><strong>Warning!</strong>
                {{adjacentImageError}}
            </div>
            <button class="btn btn-default" @click="setAdjacentImage('previous')">
                <span class="glyphicon glyphicon-chevron-left"></span>
                Previous image
            </button>
            <button class="btn btn-default" @click="setAdjacentImage('next')">
                Next image
                <span class="glyphicon glyphicon-chevron-right"></span>
            </button>
        </div>
    </div>
</template>

<script>
    export default {
        name: "NavigationImage",
        props: [
            'currentImageId'
        ],
        data() {
            return {
                adjacentImage: {},
                adjacentImageError: '',
            }
        },
        methods: {
            setAdjacentImage(position) {
                api.get(`/api/imageinstance/${this.currentMap.imageId}/${position}.json`).then(response => {
                    this.adjacentImageError = '';
                    if (!response.data.hasOwnProperty('id')) {
                        this.adjacentImageError = position == 'next' ? 'This is the last image' : 'This is the first image';
                        return;
                    }
                    this.adjacentImage = response.data;
                    this.$emit('changeImage', this.adjacentImage);
                })
            },
        }
    }
</script>

<style scoped>

</style>
