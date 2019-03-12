<template>
    <div>
        <div class="pull-right form-btns" v-if="!open">
            <button class="btn btn-success" @click="open = true"><i class="fa fa-plus" aria-hidden="true"></i> Add</button>
        </div>
        <div v-else>
            <div class="col-sm-12">
                <div class="form-horizontal">
                    <div class="form-group">
                        <label for="file" class="control-label col-sm-2">File</label>
                        <div class="col-sm-10">
                            <input type="file" id="file" ref="file" v-on:change="handleFileUpload()"/>
                        </div>

                    </div>
                    <div class="form-group">
                        <label for="name" class="control-label col-sm-2">Name</label>
                        <div class="col-sm-10">
                            <input type="text" class="form-control" id="name" v-model="name">
                        </div>

                    </div>

                    <div class="text-center form-btns">
                        <button class="btn btn-primary" @click="submitFile()">Submit</button>
                        <button class="btn btn-default" @click="open = false">Cancel</button>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script>
    export default {
        name: "AddOrEditAttachedFileModal",
        data(){
            return {
                open: false,
                name: "",
                file: []
            }
        },
        props: ['object'],
        methods: {
            submitFile(){
                let formData = new FormData();
                formData.append('files[]', this.file);
                formData.append('name', this.name);

                api.post(`/api/attachedfile.json?domainClassName=${this.object.class}&domainIdent=${this.object.id}`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                ).then(response => {
                    this.$emit('update-attachedfiles');
                    this.$notify({
                        placement: 'bottom-right',
                        type: 'success',
                        content: response.data.message
                    });
                    this.open = false;
                })
                .catch(error => {
                    this.$notify({
                        placement: 'bottom-right',
                        type: 'danger',
                        content: error.response.data.errors
                    });
                });
            },
            handleFileUpload(){
                let uploadedFiles = this.$refs.file.files;
                for(var i = 0; i < Math.max(0, uploadedFiles.length); i++){
                    this.file =  uploadedFiles[i];
                    console.log(this.file);
                    console.log(this.file.name);

                    this.name = (this.file) ? this.file.name : "";
                }
            },
        }
    }
</script>

<style scoped>
.form-btns {
    padding-bottom: 1em;
}
</style>
