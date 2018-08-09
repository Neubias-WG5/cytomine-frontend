<template>
    <div>
        <div class="alert alert-info">Choose a filter to apply</div>

        <div class="radio">
            <input v-model="selected" type="radio" :name="'filter-original-' + viewerId"
                   :id="'filter-original-' + viewerId" value="">
            <label :for="'filter-original-' + viewerId">Original</label>

            <div v-for="filter in filters" :key="filter.id">
                <input v-model="selected" type="radio" :name="'filter-'+filter.id+'-' + viewerId"
                       :id="'filter-'+filter.id+'-' + viewerId" :value="filter">
                <label :for="'filter-'+filter.id+'-' + viewerId">{{filter.name}}</label>
            </div>
        </div>

    </div>
</template>

<script>
    export default {
        name: "Filters",
        props: [
            'viewerId',
            'filters',
            'selectedFilter'
        ],
        data() {
            return {
                selected: this.selectedFilter
            }
        },
        watch: {
            selected(newValue) {
                this.$emit('update:selectedFilter', newValue)
            }
        }
    }
</script>

<style scoped>

</style>
