<template>
    <modal v-model="open" :title="addOrEdit + ' property for ' + domainName + ' ' + objectName" @hide="close"
           append-to-body>
        <form class="form-horizontal">
            <div class="form-group">
                <label for="key" class="col-sm-3 control-label">Key</label>
                <div class="col-sm-9">
                    <input v-model="localData.key" type="text" class="form-control" id="key" placeholder="Key">
                </div>
            </div>
            <div class="form-group">
                <label for="value" class="col-sm-3 control-label">Value</label>
                <div class="col-sm-9">
                    <input v-model="localData.value" type="text" class="form-control" id="value" placeholder="Value">
                </div>
            </div>
        </form>

        <div slot="footer">
            <btn @click="close">Cancel</btn>
            <btn v-if="addOrEdit == 'Edit'" type="warning" @click="tryToEdit">Edit</btn>
            <btn v-else type="success" @click="tryToAdd">Add</btn>
        </div>
    </modal>
</template>

<script>
    import Vue from 'vue'
    import Modal from "uiv/src/components/modal/Modal";

    export default {
        name: "AddOrEditPropertyModal",
        components: {Modal},
        props: ['property', 'open', 'domainName', 'objectName', 'object'],
        data() {
            return {
                localData: {"key": null, "value": null}
            }
        },
        computed: {
            addOrEdit() {
                return (this.property) ? 'Edit' : 'Add';
            }
        },
        watch: {
            open(newValue) {
                if (newValue)
                    this.localData = (this.property) ? Vue.util.extend({}, this.property) : {"key": null, "value": null}
            }
        },
        methods: {
            close() {
                this.$emit('update:open', false);
            },
            tryToEdit() {
                api.put(`api/domain/${this.object.class}/${this.object.id}/property/${this.property.id}.json`, this.localData).then(response => {
                    this.$emit('update-property', response.data.property);
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
                this.localData.domainClassName = this.object.class;
                this.localData.domainIdent = this.object.id;

                api.post(`api/property.json`, this.localData).then(response => {
                    this.$emit('add-property', response.data.property);
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
