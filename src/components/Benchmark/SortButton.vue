<template>
    <a href="#" @click.prevent="handleClick" class="pull-right">
        <i :class="cls"></i>
    </a>
</template>

<script>
    export default {
        name: "SortButton",
        props: [
            'sort',
            'field'
        ],
        data() {
            return {
                order: ''
            }
        },
        computed: {
            cls () {
                return [
                    'fa', {
                        'fa-sort text-muted': !this.order,
                        'fa-sort-up': this.order === 'asc',
                        'fa-sort-down': this.order === 'desc'
                    }
                ]
            }
        },
        watch: {
            sort: {
                handler(newValue) {
                    this.order = newValue.field === this.field ? newValue.order : ''
                },
                deep: true
            }
            // query: {
            //     handler ({ sort: field, order }) {
            //         this.order = field === this.field ? order : ''
            //     },
            //     deep: true,
            //     immediate: true
            // }
        },
        methods: {
            handleClick () {
                this.order = this.order === 'desc' ? 'asc' : 'desc';
                this.$emit('changeSort', {field: this.field, order: this.order})
            }
        }
    }
</script>

<style scoped>

</style>
