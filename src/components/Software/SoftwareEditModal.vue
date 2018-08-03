<template>
    <modal v-model="open" :title="'Edit software ' + software.fullName" @hide="close">
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
                <label for="version" class="col-sm-3 control-label">Version</label>
                <div class="col-sm-9">
                    <input v-model="localData.softwareVersion" type="text" class="form-control" id="version" placeholder="Version">
                </div>
            </div>

            <div class="form-group">
                <label for="softwareUserRepository" class="col-sm-3 control-label">Software source</label>
                <div class="col-sm-9">
                    <input v-model="localData.softwareUserRepository" type="text" class="form-control" id="softwareUserRepository" placeholder="Software source">
                </div>
            </div>

            <div class="form-group">
                <label for="resultName" class="col-sm-3 control-label">Result name</label>
                <div class="col-sm-9">
                    <input v-model="localData.resultName" type="text" class="form-control" id="resultName" placeholder="Result Name">
                </div>
            </div>

            <div class="form-group">
                <label for="executeCommand" class="col-sm-3 control-label">Execute command</label>
                <div class="col-sm-9">
                    <textarea v-model="localData.executeCommand" name="executeCommand" id="executeCommand" class="form-control" placeholder="Execute command" rows="6"></textarea>
                </div>
            </div>

            <div class="form-group">
                <label for="pullingCommand" class="col-sm-3 control-label">Pulling command</label>
                <div class="col-sm-9">
                    <textarea v-model="localData.pullingCommand" name="pullingCommand" id="pullingCommand" class="form-control" placeholder="Pulling command" rows="3"></textarea>
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
    import { Modal, Alert } from 'uiv';

    export default {
        name: "SoftwareEditModal",
        components: {
            Modal,
            Alert
        },
        data() {
            return {
                localData: {}
            }
        },
        props: [
            'open',
            'software',
            'errors'
        ],
        watch: {
            open(newValue) {
                if (newValue)
                    this.localData = JSON.parse(JSON.stringify(this.software));
            }
        },
        methods: {
            close() {
                this.$emit('close', false)
            },
            tryToEdit() {
                api.put(`api/software/${this.software.id}.json`, this.localData).then(response => {
                    this.$emit('update-software', response.data.software);
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
