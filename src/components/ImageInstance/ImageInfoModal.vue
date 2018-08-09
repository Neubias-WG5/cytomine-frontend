<template>
    <modal v-model="openModal" :title="image.instanceFilename" :footer="false" @hide="close">
        <blockquote v-if="description"><p>{{description}}</p></blockquote>

        <p class="lead">General information</p>
        <dl class="dl-horizontal">
            <dt>Name</dt>
            <dd>{{image.instanceFilename}}</dd>
            <dt>Original name</dt>
            <dd>{{image.originalFilename}}</dd>
            <dt>Path</dt>
            <dd>{{image.fullPath}}</dd>
            <dt>Identifier</dt>
            <dd>{{image.id}}</dd>
            <!--<dt>Uploaded on</dt>-->
            <!--<dd><date-item :value="abstractImage.created"></date-item></dd>-->
            <dt>Uploaded by</dt>
            <dd><username :user="creator"></username></dd>
            <dt>Added in project on</dt>
            <dd><date-item :value="image.created"></date-item></dd>
            <!--<dt>Added in project by</dt>-->
            <!--<dd></dd>-->
        </dl>

        <p class="lead">Image metadata</p>
        <ul>
            <li v-for="property in sortedMetadata">
                <b>{{property.key}}</b>: {{property.value}}
            </li>
        </ul>

        <template v-if="properties.length > 0">
            <p class="lead">Image instance properties</p>
            <ul>
                <li v-for="property in properties">
                    <b>{{property.key}}</b>: {{property.value}}
                </li>
            </ul>
        </template>
    </modal>
</template>

<script>
    import {Modal} from "uiv";
    import Username from "../User/Username";
    import DateItem from "../Datatable/DateItem";

    export default {
        name: "ImageInfoModal",
        components: {
            DateItem,
            Username,
            Modal,
        },
        props: ['image', 'open'],
        data() {
            return {
                openModal: this.open,
                currentImage: null,
                description: null,
                creator: null,
                properties: [],
                metadata: []
            }
        },
        computed: {
            sortedMetadata() {
                return this.metadata.sort((a, b) => a.key.toLowerCase().localeCompare(b.key.toLowerCase()));
            }
        },
        methods: {
            close() {
                this.$emit('update:open', false)
            }
        },
        watch: {
            open(newValue) {
                this.openModal = newValue;

                if (this.currentImage != this.image) {
                    this.currentImage = this.image;

                    api.get(`api/domain/be.cytomine.image.ImageInstance/${this.image.id}/description.json`).then(response => {
                        this.description = response.data.data;
                    }).catch(e => {
                        this.description = "";
                    });

                    api.get(`api/abstractimage/${this.image.baseImage}/user.json`).then(response => {
                        this.creator = response.data;
                    });

                    api.get(`api/domain/be.cytomine.image.ImageInstance/${this.image.id}/property.json`).then(response => {
                        this.properties = response.data.collection;
                    });

                    api.get(`api/domain/be.cytomine.image.AbstractImage/${this.image.baseImage}/property.json`).then(response => {
                        this.metadata = response.data.collection;
                    });
                }
            },
        },
    }
</script>

<style scoped>

</style>
