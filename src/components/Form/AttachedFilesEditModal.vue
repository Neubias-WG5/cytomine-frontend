<template>
    <modal v-model="open" :title="'Edit attached files for ' + domainName + ' ' + name" @hide="close" append-to-body>
        <div class="pull-right">
            <button class="btn btn-success" @click="add()"><i class="fa fa-plus" aria-hidden="true"></i> Add</button>
        </div>
        <table class="table table-striped table-bordered">
            <thead>
            <tr>
                <th>ID</th>
                <th>Key</th>
                <th>Value</th>
                <th>Action(s)</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="attachedFile in attachedFiles">
                <td>{{attachedFile.id}}</td>
                <td>{{attachedFile.name}}</td>
                <td>{{attachedFile.filename}}</td>
                <td>
                    <div class="btn-group pull-right">
                        <button class="btn btn-default btn-xs" @click="edit(attachedFile)">
                            <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
                        </button>
                        <delete-object-button :object="attachedFile" domain="attachedfile" domain-pretty-print="attached file">
                        </delete-object-button>
                    </div>
                </td>
            </tr>
            <tr v-if="!attachedFiles.length">
                <td colspan="4">No attached file yet.</td>
            </tr>
            </tbody>
        </table>
        <add-or-edit-attached-file-modal :attachedFile="selectedAttachedFile" :open.sync="openAddOrEdit" :domain-name="domainName"
                                    :object-name="name" :object="object"></add-or-edit-attached-file-modal>
    </modal>
</template>

<script>
    import Modal from "uiv/src/components/modal/Modal";
    import DeleteObjectButton from "./DeleteObjectButton";
    import AddOrEditAttachedFileModal from "./AddOrEditAttachedFileModal";

    export default {
        name: "AttachedFilesEditModal",
        components: {
            AddOrEditAttachedFileModal,
            Modal,
            DeleteObjectButton
        },
        props: ['object', 'domainName', 'name', 'open'],
        data() {
            return {
                openAddOrEdit: false,
                attachedFiles: [],
                selectedAttachedFile: null,
            }
        },
        watch: {
            open(newValue) {
                if (newValue) {
                    api.get(`api/domain/${this.object.class}/${this.object.id}/attachedfile.json`).then(response => {
                        this.attachedFiles = response.data.collection;
                    })
                }
            }
        },
        methods: {
            close() {
                this.$emit('update:open', false)
            },
            edit(attachedFile) {
                this.selectedAttachedFile = attachedFile;
                this.openAddOrEdit = true;
            },
            add() {
                this.selectedAttachedFile = null;
                this.openAddOrEdit = true;
            }
        },
    }
</script>

<style scoped>

</style>
