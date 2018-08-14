<template>
    <div>
        <h4>
            <i class="fas fa-search"></i> Digital zoom
        </h4>
        <div class="alert alert-info">Enable or disable digital zoom (interpolation)</div>
        <input @change="toggleDigitalZoom" v-model="digitalZoom" type="checkbox" :name="'digital-zoom-'+viewerId"
               :id="'digital-zoom-'+viewerId">
        <label :for="'digital-zoom-'+viewerId">Digital zoom</label>
    </div>
</template>

<script>
    export default {
        name: 'DigitalZoom',
        props: [
            'viewerId'
        ],
        data() {
            return {
                digitalZoom: false,
            }
        },
        methods: {
            toggleDigitalZoom() {
                let increment = 4;
                this.$emit('incrementMaxZoom', (this.digitalZoom) ? increment : (-1) * increment)
            }
        }
    }
</script>

<style>

</style>
