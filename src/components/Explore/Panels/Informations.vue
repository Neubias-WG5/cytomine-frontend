<template>
    <div>
        <dl class="dl-horizontal">
            <dt>Name</dt>
            <dd v-if="!project.blindMode">{{image.instanceFilename}}</dd>
            <dd v-else>[BLIND] {{image.id}}</dd>
            <dt>Original name</dt>
            <dd v-if="!project.blindMode">{{image.originalFilename}}</dd>
            <dd v-else>[BLIND] {{image.baseImage}}</dd>
            <dt>Width</dt>
            <dd>{{image.width}} pixels</dd>
            <dt>Height</dt>
            <dd>{{image.height}} pixels</dd>
            <dt>Original resolution</dt>
            <dd v-if="image.resolution">{{image.resolution.toPrecision(3)}} µm/pixel</dd>
            <dd v-else><span class="label label-default">Undefined</span></dd>
            <dt>Original magnification</dt>
            <dd v-if="image.magnification">{{image.magnification}}X</dd>
            <dd v-else><span class="label label-default">Undefined</span></dd>
            <dt>Status</dt>
            <dd v-if="image.reviewed"><span class="label label-sucess">Reviewed</span></dd>
            <dd v-else-if="image.inReview"><span class="label label-warning">In review</span></dd>
            <dd v-else><span class="label label-info">Not reviewed</span></dd>
        </dl>

        <div class="text-center" v-if="!project.blindMode">
            <div class="btn-group">
                <!--<div class="btn-group" v-if="!project.blindMode">-->
                    <!--<button class="btn btn-default btn-xs"><i class="fa fa-pencil-square-o" aria-hidden="true"></i> Rename</button>-->
                <!--</div>-->
                <a :href="`/api/imageinstance/${image.id}/download`" class="btn btn-default btn-xs">
                    <i class="fa fa-download" aria-hidden="true"></i> Download
                </a>
                <div class="btn-group">
                    <button class="btn btn-default btn-xs" @click="openImageMoreInfo=true">
                        <i class="fa fa-info-circle" aria-hidden="true"></i> More info
                    </button>
                </div>
            </div>
        </div>
        <image-info-modal :open.sync="openImageMoreInfo" :image="image"></image-info-modal>
    </div>
</template>

<script>
    import ImageInfoModal from "../../ImageInstance/ImageInfoModal";
    export default {
        name: 'Informations',
        components: {ImageInfoModal},
        props: [
            'image',
            'project',
        ],
        data() {
            return {
                openImageMoreInfo: false
            }
        },
    }
</script>

<style scoped>
    dd {
        margin-bottom: 1em;
    }
</style>
