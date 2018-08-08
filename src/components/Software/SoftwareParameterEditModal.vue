<template>
    <modal v-model="open" :title="'Edit software parameter ' + sp.name" @hide="close">
        <alert type="warning"><b>Warning!</b> Only use this form for on-the-fly edition. Cytomine software are automatically added
            from trusted software sources. To make changes persistent, edit the software descriptor on this source and provide a new release.</alert>

        <alert type="danger" v-if="errors">{{errors}}</alert>

        <form class="form-horizontal">
            <div class="form-group">
                <label for="name" class="col-sm-3 control-label">Name</label>
                <div class="col-sm-9">
                    <input v-model="localData.name" type="text" class="form-control" id="name" placeholder="Name">
                </div>
            </div>
            <div class="form-group">
                <label for="human-name" class="col-sm-3 control-label">Human name</label>
                <div class="col-sm-9">
                    <input v-model="localData.humanName" type="text" class="form-control" id="human-name" placeholder="Human name">
                </div>
            </div>
            <div class="form-group">
                <label for="type" class="col-sm-3 control-label">Type</label>
                <div class="col-sm-9">
                    <select v-model="localData.type" class="form-control" id="type">
                        <option disabled value="">Please select one</option>
                        <option>Number</option>
                        <option>String</option>
                        <option>Boolean</option>
                        <option>Date</option>
                        <option>Domain</option>
                        <option>ListDomain</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label for="default-value" class="col-sm-3 control-label">Default value</label>
                <div class="col-sm-9">
                    <input v-model="localData.defaultParamValue" type="text" class="form-control" id="default-value" placeholder="Default value">
                </div>
            </div>
            <div class="form-group">
                <label for="required" class="col-sm-3 control-label">Required</label>
                <div class="col-sm-9">
                    <input v-model="localData.required" type="checkbox" class="checkbox" id="required">
                </div>
            </div>
            <div class="form-group">
                <label for="value-key" class="col-sm-3 control-label">Value key</label>
                <div class="col-sm-9">
                    <input v-model="localData.valueKey" type="text" class="form-control" id="value-key" placeholder="Value key">
                </div>
            </div>
            <div class="form-group">
                <label for="command-line-flag" class="col-sm-3 control-label">Command line flag</label>
                <div class="col-sm-9">
                    <input v-model="localData.commandLineFlag" type="text" class="form-control" id="command-line-flag" placeholder="Command line flag">
                </div>
            </div>
        </form>

        <div slot="footer">
            <btn @click="close">Cancel</btn>
            <btn type="warning" @click="tryToEdit">Edit</btn>
        </div>
    </modal>
</template>

<script>
    import Vue from 'vue'
    import { Modal, Alert } from 'uiv';

    export default {
        name: "SoftwareParameterEditModal",
        components: {
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
            'sp',
        ],
        watch: {
            open(newValue) {
                if (newValue)
                    this.localData = Vue.util.extend({}, this.sp);
            }
        },
        methods: {
            close() {
                this.$emit('update:open', false)
            },
            tryToEdit() {
                api.put(`api/softwareparameter/${this.sp.id}.json`, this.localData).then(response => {
                    this.$emit('update-softwareparameter', response.data.softwareparameter);
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
