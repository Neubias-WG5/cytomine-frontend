<template>
    <span class="td-date">
        {{ parseInt(value) | moment("YYYY-MM-DD, HH:mm:ss") }}
    </span>
</template>

<script>
    export default {
        name: 'DateItem',
        props: ['value']
    }
</script>

<style scoped>

</style>
