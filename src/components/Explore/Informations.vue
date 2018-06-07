<template>
    <div style="min-height: 300px">
        <div class="text-center">
            <div class="btn-group mt-4">
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
        <!--<div class="text-center">-->
            <!--<div class="btn-group">-->
                <!--<a :href="`#tabs-image-${currentMap.data.project}-${currentMap.imageId}-0`" class="btn btn-info">Explore</a>-->
                <!--<button class="btn btn-info dropdown-toggle" data-toggle="dropdown" aria-haspopup="true"-->
                        <!--aria-expanded="false">-->
                    <!--<span class="caret"></span>-->
                    <!--<span class="sr-only">Toggle dropdown</span>-->
                <!--</button>-->
                <!--<ul class="dropdown-menu text-left">-->
                    <!--<li><a @click="reviewMode"-->
                           <!--:href="`#tabs-review-${this.currentMap.data.project}-${this.currentMap.imageId}-`">Review</a>-->
                    <!--</li>-->
                    <!--<li><a :href="`#tabs-reviewdash-${currentMap.data.project}-${currentMap.imageId}-null-null`">Review-->
                        <!--(Cyto)</a></li>-->
                    <!--<li><a @click="validateImage" href="#">Validate image</a></li>-->
                    <!--<li><a href="#">Copy image and annotations</a></li>-->
                    <!--<li><a href="#">Import user annotations</a></li>-->
                    <!--<li><a href="#">Description</a></li>-->
                    <!--<li><a :href="`/api/imageinstance/${currentMap.imageId}/download`">Download</a></li>-->
                    <!--<li><a href="#">Rename</a></li>-->
                    <!--<li><a href="#">Delete</a></li>-->
                    <!--<li><a href="#">More info</a></li>-->
                <!--</ul>-->
            <!--</div>-->
        <!--</div>-->
        <dl class="mt-4 dl-horizontal">
            <dt>Name</dt>
            <dd>{{instanceFilename}}</dd>
            <dt>Original name</dt>
            <dd>{{originalFilename}}</dd>
            <dt>Width</dt>
            <dd>{{currentMap.data.width}} pixels</dd>
            <dt>Height</dt>
            <dd>{{currentMap.data.height}} pixels</dd>
            <dt>Original resolution</dt>
            <dd v-if="currentMap.data.resolution">{{currentMap.data.resolution.toPrecision(3)}} µm/pixel</dd>
            <dd v-else><span class="label label-default">Undefined</span></dd>
            <dt>Original magnification</dt>
            <dd v-if="currentMap.data.magnification">{{currentMap.data.magnification}}X</dd>
            <dd v-else><span class="label label-default">Undefined</span></dd>
            <dt>Status</dt>
            <dd v-if="currentMap.data.reviewed"><span class="label label-sucess">Reviewed</span></dd>
            <dd v-else-if="currentMap.data.inReview"><span class="label label-warning">In review</span></dd>
            <dd v-else><span class="label label-info">Not reviewed</span></dd>
        </dl>
    </div>
</template>

<script>
    import OlTile from 'ol/layer/tile';
    import Zoomify from 'ol/source/zoomify';
    import Group from 'ol/layer/group';

    export default {
        name: 'Informations',
        props: [
            'currentMap',
            'imsBaseUrl',
            'filterUrl',
            'project',
        ],
        data() {
            return {
                adjacentImage: {},
                adjacentImageError: '',
                showDropdown: false,
            }
        },
        computed: {
            instanceFilename() {
                if (this.project.blindMode)
                    return `[BLIND] ${this.currentMap.imageId}`;
                return this.currentMap.data.instanceFilename
            },
            originalFilename() {
                if (this.project.blindMode)
                    return `[BLIND] ${this.currentMap.data.baseImage}`;
                return this.currentMap.data.originalFilename
            },
        },
        watch: {
            adjacentImage(newValue) {
                this.$emit('updateMap', newValue);
            }
        },
        methods: {
            reviewMode() {
                api.put(`/api/imageinstance/${this.currentMap.imageId}/review.json`, {
                    id: this.currentMap.imageId,
                }).then(data => {
                    this.$emit('updateMap', data.data.imageinstance);
                })
            },
            validateImage() {
                api.delete(`/api/imageinstance/${this.currentMap.imageId}/review.json`).then(data => {
                    this.$emit('updateMap', data.data.imageinstance);
                })
            },
            setAdjacentImage(position) {
                api.get(`/api/imageinstance/${this.currentMap.imageId}/${position}.json`).then(data => {
                    this.adjacentImageError = '';
                    if (!data.data.hasOwnProperty('id')) {
                        this.adjacentImageError = position == 'next' ? 'This is the last image' : 'This is the first image';
                        ;
                        return;
                    }
                    this.adjacentImage = data.data;
                    api.get(`/api/abstractimage/${this.adjacentImage.baseImage}/imageservers.json?&imageinstance=${this.adjacentImage.id}`).then(data => {
                        this.$emit('updateImsServer', data.data.imageServersURLs[0]);
                        this.$emit('changeImage', this.adjacentImage);
                    })
                })
            },
        },
    }
</script>

<style scoped>
    dd {
        margin-bottom: 1em;
    }

    .display-block {
        display: block;
        margin-bottom: 1em;
    }

    .mt-4 {
        margin-top: 1em;
    }
</style>
