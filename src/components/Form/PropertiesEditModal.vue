<template>
    <modal v-model="open" :title="'Edit properties for ' + domainName + ' ' + name" @hide="close" append-to-body>
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
            <tr v-for="property in properties">
                <td>{{property.id}}</td>
                <td>{{property.key}}</td>
                <td>{{property.value}}</td>
                <td>
                    <div class="btn-group pull-right">
                        <button class="btn btn-default btn-xs" @click="edit(property)">
                            <i class="fa fa-edit" aria-hidden="true"></i>
                        </button>
                        <delete-object-button :object="property" domain="property" domain-pretty-print="property">
                        </delete-object-button>
                    </div>
                </td>
            </tr>
            <tr v-if="!properties.length">
                <td colspan="4">No properties yet.</td>
            </tr>
            </tbody>
        </table>
        <add-or-edit-property-modal :property="selectedProperty" :open.sync="openAddOrEdit" :domain-name="domainName"
                                    :object-name="name" :object="object"></add-or-edit-property-modal>
    </modal>
</template>

<script>
    import Modal from "uiv/src/components/modal/Modal";
    import DeleteObjectButton from "./DeleteObjectButton";
    import AddOrEditPropertyModal from "./AddOrEditPropertyModal";

    export default {
        name: "PropertiesEditModal",
        components: {
            AddOrEditPropertyModal,
            Modal,
            DeleteObjectButton
        },
        props: ['object', 'domainName', 'name', 'open'],
        data() {
            return {
                openAddOrEdit: false,
                properties: [],
                selectedProperty: null,
            }
        },
        watch: {
            open(newValue) {
                if (newValue) {
                    api.get(`api/domain/${this.object.class}/${this.object.id}/property.json`).then(response => {
                        this.properties = response.data.collection;
                    })
                }
            }
        },
        methods: {
            close() {
                this.$emit('update:open', false)
            },
            edit(property) {
                this.selectedProperty = property;
                this.openAddOrEdit = true;
            },
            add() {
                this.selectedProperty = null;
                this.openAddOrEdit = true;
            }
        },
    }
</script>

<style scoped>

</style>
