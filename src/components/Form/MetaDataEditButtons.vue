<template>
    <div>
        <div class="btn-group btn-group-justified" role="group">
            <div class="btn-group" role="group">
                <button type="button" class="btn btn-default" @click="openDescription=true">
                    Edit description <i class="fa fa-align-left" aria-hidden="true"></i>
                </button>
            </div>
            <div class="btn-group" role="group">
                <button type="button" class="btn btn-default" @click="openProperties=true">
                    Edit properties <i class="fa fa-tags" aria-hidden="true"></i>
                </button>
            </div>
            <div class="btn-group" role="group">
                <button type="button" class="btn btn-default" @click="openAttachedFiles=true">
                    Edit attached files <i class="fa fa-files-o" aria-hidden="true"></i>
                </button>
            </div>
        </div>

        <description-edit-modal :open.sync="openDescription" :object="object" :domain-name="domainName"
                                :name="objectName"></description-edit-modal>
        <properties-edit-modal :open.sync="openProperties" :object="object" :domain-name="domainName"
                               :name="objectName"></properties-edit-modal>
        <attached-files-edit-modal :open.sync="openAttachedFiles" :object="object" :domain-name="domainName"
                                   :name="objectName"></attached-files-edit-modal>
    </div>
</template>

<script>
    import DescriptionEditModal from "./DescriptionEditModal";
    import PropertiesEditModal from "./PropertiesEditModal";
    import AttachedFilesEditModal from "./AttachedFilesEditModal";

    export default {
        name: "MetaDataEditModal",
        components: {AttachedFilesEditModal, PropertiesEditModal, DescriptionEditModal},
        props: ['object', 'domainName', 'objectName'],
        data() {
            return {
                openDescription: false,
                openProperties: false,
                openAttachedFiles: false,
            }
        }
    }
</script>

<style scoped>

</style>
