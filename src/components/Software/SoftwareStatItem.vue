<template>
    <span :class="['label', label]">{{ value }}</span>
</template>

<script>
    export default {
        name: "SoftwareStatItem",
        props: ['field', 'value'],
        computed: {
            label() {
                let field = this.field.toLowerCase();
                if (field.includes("inqueue"))
                    return 'label-info';
                else if (field.includes("running"))
                    return 'label-primary';
                else if (field.includes("success"))
                    return 'label-success';
                else if (field.includes("failed"))
                    return 'label-danger';
                else if (field.includes("wait"))
                    return 'label-warning';
                else if (field.includes("killed"))
                    return 'label-killed';
                else
                    return 'label-default';
            }
        }
    }
</script>

<style scoped>
    .label-killed {
        background-color: black;
    }
</style>
