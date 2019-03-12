<template>
    <modal v-model="open" :title="'Attached files for ' + objectName" @hide="close" append-to-body size="lg" :footer="false">
        <add-or-edit-attached-file-modal @update-attachedfiles="loadData()" :object="object"></add-or-edit-attached-file-modal>
        <table class="table table-striped table-bordered">
            <thead>
            <tr>
                <th>#</th>
                <th>Created on</th>
                <th>Name</th>
                <th>Filename</th>
                <th>Action(s)</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="attachedFile in sortedAttachedFiles">
                <td>{{attachedFile.id}}</td>
                <td><date-item :value="attachedFile.created"></date-item></td>
                <td>{{attachedFile.name}}</td>
                <td>{{attachedFile.filename}}</td>
                <td>
                    <div class="btn-group pull-right">
                        <a :href="`api/attachedfile/${attachedFile.id}/download`" role="button" class="btn btn-default btn-xs">
                            <i class="fas fa-file-download"></i> Download
                        </a>
                        <delete-object-button v-if="!isGuest" :object="attachedFile" domain="attachedfile"
                                              domain-pretty-print="attached file" @delete-attachedfile="loadData()">
                        </delete-object-button>
                    </div>
                </td>
            </tr>
            <tr v-if="!attachedFiles.length">
                <td colspan="5">No attached file yet.</td>
            </tr>
            </tbody>
        </table>

    </modal>
</template>

<script>
    import Modal from "uiv/src/components/modal/Modal";
    import DeleteObjectButton from "./DeleteObjectButton";
    import AddOrEditAttachedFileModal from "./AddOrEditAttachedFileModal";
    import DateItem from "../Datatable/DateItem";

    export default {
        name: "AttachedFilesEditModal",
        components: {
            DateItem,
            AddOrEditAttachedFileModal,
            Modal,
            DeleteObjectButton
        },
        props: ['object', 'domainName', 'name', 'open', 'isGuest'],
        data() {
            return {
                openAddOrEdit: false,
                attachedFiles: [],
                selectedAttachedFile: null,
            }
        },
        computed: {
            objectName() {
                return (this.object && this.object.hasOwnProperty('name')) ? this.object.name : '';
            },
            sortedAttachedFiles() {
                if (!this.attachedFiles)
                    return [];

                return this.attachedFiles.sort((a, b) => {
                    return b.id - a.id
                })
            }
        },
        watch: {
            open(newValue) {
                if (newValue) {
                    this.loadData()
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
            },
            loadData() {
                api.get(`api/domain/${this.object.class}/${this.object.id}/attachedfile.json`).then(response => {
                    this.attachedFiles = response.data.collection;
                })
            }
        },
    }
</script>

<style scoped>

</style>
