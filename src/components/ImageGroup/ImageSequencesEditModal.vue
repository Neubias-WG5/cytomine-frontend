<template>
    <modal v-model="open" :title="title" @hide="close" size="lg">
        <alert type="danger" v-if="errors">{{errors}}</alert>
        <table class="table table-striped table-bordered">
            <thead>
            <tr>
                <th>#</th>
                <th>Preview</th>
                <th>Name</th>
                <th>Detected sequence</th>
                <th>Status</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="image in paginatedImages" :key="image.id">
                <td>{{image.id}}</td>
                <td>
                    <div style='width : 70px;' v-if="image.thumb">
                        <img :src="image.thumb" alt="originalFilename" style="max-height : 45px;max-width : 68px;"/>
                    </div>
                </td>
                <td>{{image.instanceFilename}}</td>
                <th>
                    <span v-if="image.c">c: {{image.c}} | </span>
                    <span v-if="image.z">z: {{image.z}} | </span>
                    <span v-if="image.t">t: {{image.t}}</span>
                </th>
                <th>
                    <span class="label label-default" v-if="image.c == null && image.z == null && image.t == null">Incompatible</span>
                    <span class="label label-success" v-else-if="isInSequence(image)">In group</span>
                    <span class="label label-info" v-else>To add</span>
                </th>
            </tr>
            </tbody>
        </table>
        <div class="text-center">
            <paginate v-if="totalPages > 1" :page-count="totalPages" v-model="page" :container-class="'pagination'"
                      :prev-text="'&laquo;'" :next-text="'&raquo;'"></paginate>
        </div>

        <div slot="footer">
            <button class="btn btn-default" @click="close">Cancel</button>
            <!--<button class="btn btn-warning" @click="tryToEdit" v-if="group">Edit</button>-->
            <button class="btn btn-success" @click="tryToAdd" v-if="nbToAdd > 0">Add {{nbToAdd}} images to group</button>
        </div>
    </modal>
</template>

<script>
    import Vue from 'vue'
    import {Modal, Alert} from 'uiv';
    import MetaDataEditButtons from "../Form/MetaDataEditButtons";
    import Paginate from 'vuejs-paginate';

    export default {
        name: "ImageSequencesEditModal",
        components: {
            MetaDataEditButtons,
            Modal,
            Alert,
            Paginate
        },
        data() {
            return {
                images: [],
                sequences: [],
                errors: null,
                totalPages: 1,
                page: 1,
                perPage: 10,
            }
        },
        props: [
            'open',
            'group',
        ],
        computed: {
            title() {
                if (this.group)
                    return `Sequences for image group ${this.group.name} (#${this.group.id})`;
            },
            paginatedImages() {
                return this.images.slice((this.page - 1) * this.perPage, this.page * this.perPage)
            },
            imagesToAdd() {
                return this.images.filter(image => !image.isInSequence
                    && !(image.c == null && image.z == null && image.t == null))
            },
            nbToAdd() {
                return this.imagesToAdd.length;
            }
        },
        watch: {
            open(newValue) {
                if (newValue)
                    this.loadData();
            }
        },
        methods: {
            close() {
                this.$emit('update:open', false)
            },
            loadData() {
                api.get(`api/imagegroup/${this.group.id}/imagesequence.json`).then(response => {
                    this.sequences = response.data.collection;
                    api.get(`api/project/${this.group.project}/imageinstance.json`).then(response => {
                        this.images.splice(0, this.images.length);
                        response.data.collection.map(image => {
                            let c = image.instanceFilename.match(/(?:-|_)c[0-9]*/i);
                            let z = image.instanceFilename.match(/(?:-|_)z[0-9]*/i);
                            let t = image.instanceFilename.match(/(?:-|_)t[0-9]*/i);

                            image.c = (c) ? c[0].substr(2) : c;
                            image.z = (z) ? z[0].substr(2) : z;
                            image.t = (t) ? t[0].substr(2) : t;
                            image.isInSequence = this.isInSequence(image);
                            this.images.push(image)
                        });
                        this.totalPages = Math.ceil(this.images.length / this.perPage);

                    })
                })
            },
            isInSequence(image) {
                return this.sequences.find(seq => seq.channel == image.c && seq.zStack == image.z && seq.time == image.t) != undefined;
            },
            // tryToEdit() {
            //     api.put(`api/imagegroup/${this.group.id}.json`, this.localData).then(response => {
            //         this.$emit('updateList');
            //         this.$notify({
            //             placement: 'bottom-right',
            //             type: 'success',
            //             content: response.data.message
            //         });
            //         this.close();
            //     }).catch(error => {
            //         console.log(error);
            //         this.errors = error.response.data.error;
            //     })
            // },
            tryToAdd() {
                api.post(`api/imagesequence.json`, this.imagesToAdd.map(image => {
                    return {
                        imageGroup: this.group.id,
                        image: image.id,
                        channel: image.c || 0,
                        zStack: image.z || 0,
                        time: image.t || 0,
                        slice: 0,
                    }
                })).then(response => {
                    this.$emit('updateList');
                    this.$notify({
                        placement: 'bottom-right',
                        type: 'success',
                        content: response.data.message
                    });
                    this.close();
                }).catch(error => {
                    console.log(error);
                    this.errors = error.response.data.error;
                })
            }
        }
    }
</script>

<style >
    .modal-lg {
        width: 60%;
    }
</style>
