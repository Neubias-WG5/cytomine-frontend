<template>
    <button class="btn btn-default btn-xs" @click="confirm"><i class="fa fa-trash" aria-hidden="true"></i></button>
</template>

<script>
    export default {
        name: "DeleteObjectButton",
        props: ['object', 'domain', 'domainPrettyPrint'],
        methods: {
            confirm () {
                this.$confirm({
                    title: 'Confirm',
                    okType: 'danger',
                    okText: 'Delete',
                    content: `This ${this.domainPrettyPrint} "${this.object.name}" will be permanently deleted. Continue?`
                })
                    .then(() => {
                        api.delete(`api/${this.domain}/${this.object.id}.json`).then(response => {
                            this.$emit(`delete-${this.domain}`, this.object);
                            this.$notify({
                                placement: 'bottom-right',
                                type: 'success',
                                content: response.data.message
                            })
                        }).catch(error => {
                            this.$notify({
                                placement: 'bottom-right',
                                type: 'danger',
                                content: error.response.data.errors
                            })
                        })

                    })
                    .catch(() => {
                        this.$notify({
                            placement: 'bottom-right',
                            content: 'Delete operation aborted.'
                        })
                    })
            }
        }
    }
</script>

<style scoped>

</style>
