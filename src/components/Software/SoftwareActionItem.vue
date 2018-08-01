<template>
    <btn-group>
        <btn size="xs"><i class="fa fa-plus" aria-hidden="true"></i> Details</btn>
    </btn-group>
</template>

<script>
    import {BtnGroup, Btn} from 'uiv'
    export default {
        name: "SoftwareActionItem",
        props: ['value', 'row'],
        components: {
            BtnGroup,
            Btn
        }
    }
</script>

<style scoped>

</style>
