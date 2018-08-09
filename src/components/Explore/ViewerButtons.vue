<template>
    <div class="bottom-panel btn-group" role="group">
        <button v-if="mustBeShown('project-explore-info')" @click="setSelected('informations')"
                :class="['btn', 'btn-default', {active: selectedComponent == 'informations' }]" title="Informations">
            <span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span>
        </button>
        <button v-if="mustBeShown('project-explore-link') && hasMultiViews"
                @click="setSelected('linkmap')"
                :class="['btn', 'btn-default', {active: selectedComponent == 'linkmap' }]" title="Vue link">
            <span class="glyphicon glyphicon-link" aria-hidden="true"></span>
        </button>
        <button v-if="mustBeShown('project-explore-image-layers') && hasFilters"
                @click="setSelected('filter')"
                :class="['btn', 'btn-default', {active: selectedComponent == 'filter' }]" title="Image filters">
            <span class="glyphicon glyphicon-filter" aria-hidden="true"></span>
        </button>
        <button v-if="mustBeShown('project-explore-digital-zoom')" @click="setSelected('digitalZoom')"
                :class="['btn', 'btn-default', {active: selectedComponent == 'digitalZoom' }]" title="Digital zoom">
            <span class="glyphicon glyphicon-zoom-in" aria-hidden="true"></span>
        </button>
        <button v-if="mustBeShown('project-explore-colormap')" @click="setSelected('colormap')"
                :class="['btn', 'btn-default', {active: selectedComponent == 'colormap' }]" title="Color maps">
            <span class="glyphicon glyphicon-adjust" aria-hidden="true"></span>
        </button>
        <button @click="setSelected('annotationLayers')"
                :class="['btn', 'btn-default', {active: selectedComponent == 'annotationLayers' }]"
                title="Annotation layers">
            Annotation layers
        </button>
        <button v-if="mustBeShown('project-explore-annotation-panel')"
                @click="setSelected('annotationList')"
                :class="['btn', 'btn-default', {active: selectedComponent == 'annotationList' }]"
                title="User annotations list">
            <span class="glyphicon glyphicon-list" aria-hidden="true"></span>
            Annotation list
        </button>
        <button v-if="hasImageGroups" @click="setSelected('multidimension')"
                :class="['btn', 'btn-default', {active: selectedComponent == 'multidimension' }]"
                title="Multidimension">
            Multidimension
        </button>
        <button v-if="isReviewing" @click="setSelected('review')"
                :class="['btn', 'btn-default', {active: selectedComponent == 'review' }]" title="Review">
            <span class="glyphicon glyphicon-check" aria-hidden="true"></span>
            Review
        </button>
        <button v-if="mustBeShown('project-explore-property')" @click="setSelected('properties')"
                :class="['btn', 'btn-default', {active: selectedComponent == 'properties' }]"
                title="Annotation properties">
            <span class="glyphicon glyphicon-tag" aria-hidden="true"></span>
        </button>
        <button v-if="hasMultiViews" class="btn btn-danger" @click="$emit('deleteViewer')"
                title="Remove this view from the explorer">
            <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
        </button>
    </div>
</template>

<script>
    import mustBeShown from '../../helpers/mustBeShown';

    export default {
        name: 'ViewerButtons',
        props: [
            'selectedComponent',
            'hasMultiViews',
            'hasFilters',
            'hasImageGroups',
            'isReviewing',
            'projectConfig'
        ],
        data() {
            return {
                selected: this.selectedComponent
            }
        },
        methods: {
            setSelected(component) {
                if (component == this.selected) {
                    this.selected = "";
                } else {
                    this.selected = component;
                }

                this.$emit('update:selectedComponent', this.selected);
            },
            mustBeShown(key) {
                return mustBeShown(key, this.projectConfig);
            },
        }
    }
</script>

<style scoped>

</style>
