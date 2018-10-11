<template>
    <modal v-model="open" :title="title" @hide="close">
        <alert type="danger" v-if="errors">{{errors}}</alert>
        <div class="form-horizontal">
            <div class="form-group">
                <label for="name" class="col-sm-3 control-label">Name</label>
                <div class="col-sm-9">
                    <input v-model="localData.name" type="text" class="form-control" id="name" placeholder="Name">
                </div>
            </div>
        </div>

        <div slot="footer">
            <button class="btn btn-default" @click="close">Cancel</button>
            <button class="btn btn-warning" @click="tryToEdit" v-if="group">Edit</button>
            <button class="btn btn-success" @click="tryToAdd" v-else>Add</button>
        </div>
    </modal>
</template>

<script>
    import Vue from 'vue'
    import {Modal, Alert} from 'uiv';
    import MetaDataEditButtons from "../Form/MetaDataEditButtons";

    export default {
        name: "ImageGroupEditModal",
        components: {
            MetaDataEditButtons,
            Modal,
            Alert
        },
        data() {
            return {
                localData: {},
                errors: null
            }
        },
        props: [
            'open',
            'group',
            'project'
        ],
        computed: {
            title() {
                if (!this.group)
                    return "Add a new image group";
                else
                    return `Rename image group #${this.group.id}`;
            }
        },
        watch: {
            open(newValue) {
                if (newValue)
                    this.localData = Vue.util.extend({}, this.group);
            }
        },
        methods: {
            close() {
                this.$emit('update:open', false)
            },
            tryToEdit() {
                api.put(`api/imagegroup/${this.group.id}.json`, this.localData).then(response => {
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
            },
            tryToAdd() {
                this.localData.project = this.project.id;
                api.post(`api/imagegroup.json`, this.localData).then(response => {
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

<style scoped>

</style>
