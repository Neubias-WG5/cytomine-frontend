<template>
    <span class="td-date">
        <template v-if="!isNaN(integerValue)">
            {{ integerValue | moment("YYYY-MM-DD, HH:mm:ss") }}
        </template>
        <template v-else>
            <em>Never</em>
        </template>

    </span>
</template>

<script>
    export default {
        name: 'DateItem',
        props: ['value'],
        computed: {
            integerValue() {
                return parseInt(this.value)
            }
        }
    }
</script>

<style scoped>

</style>
