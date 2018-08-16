<template>
    <div class="bottom-panel btn-group" role="group">
        <button v-if="mustBeShown('project-explore-info')" @click="setSelected('informations')"
                :class="['btn', 'btn-default', {active: selectedComponent == 'informations' }]" title="Informations">
            <i class="fas fa-info-circle"></i>
        </button>
        <button v-if="mustBeShown('project-explore-link') && hasMultiViews"
                @click="setSelected('linkmap')"
                :class="['btn', 'btn-default', {active: selectedComponent == 'linkmap' }]" title="Vue link">
            <i class="fas fa-link"></i>
        </button>
        <button v-if="mustBeShown('project-explore-image-layers') && hasFilters"
                @click="setSelected('filter')"
                :class="['btn', 'btn-default', {active: selectedComponent == 'filter' }]" title="Image filters">
            <i class="fas fa-filter"></i>
        </button>
        <button v-if="mustBeShown('project-explore-digital-zoom')" @click="setSelected('digitalZoom')"
                :class="['btn', 'btn-default', {active: selectedComponent == 'digitalZoom' }]" title="Digital zoom">
            <i class="fas fa-search"></i>
        </button>
        <button v-if="mustBeShown('project-explore-colormap')" @click="setSelected('colormap')"
                :class="['btn', 'btn-default', {active: selectedComponent == 'colormap' }]" title="Color maps">
            <i class="fas fa-adjust"></i>
        </button>
        <button @click="setSelected('annotationLayers')"
                :class="['btn', 'btn-default', {active: selectedComponent == 'annotationLayers' }]"
                title="Annotation layers">
            <i class="fas fa-layer-group"></i>
        </button>
        <button @click="setSelected('ontology')"
                :class="['btn', 'btn-default', {active: selectedComponent == 'ontology' }]"
                title="Ontology">
            <i class="fas fa-palette"></i>
        </button>
        <button v-if="mustBeShown('project-explore-annotation-panel')"
                @click="setSelected('annotationList')"
                :class="['btn', 'btn-default', {active: selectedComponent == 'annotationList' }]"
                title="User annotations list">
            <i class="fas fa-shapes"></i>
        </button>
        <button v-if="hasImageSequences" @click="setSelected('multidimension')"
                :class="['btn', 'btn-default', {active: selectedComponent == 'multidimension' }]"
                title="Multidimension">
            <i class="fas fa-images"></i>
        </button>
        <button v-if="isReviewing" @click="setSelected('review')"
                :class="['btn', 'btn-default', {active: selectedComponent == 'review' }]" title="Review">
            <i class="fas fa-check-circle"></i>
        </button>
        <button v-if="hasAnnotationProperties && mustBeShown('project-explore-property')" @click="setSelected('properties')"
                :class="['btn', 'btn-default', {active: selectedComponent == 'properties' }]"
                title="Annotation properties">
            <i class="fas fa-tags"></i>
        </button>
        <button v-if="hasOnlineUsers" @click="setSelected('follow')"
                :class="['btn', 'btn-default', {active: selectedComponent == 'follow' }]" title="Follow user">
            <i class="fas fa-chess-rook"></i>
        </button>
        <button v-if="hasMultiViews" class="btn btn-danger" @click="$emit('deleteViewer')"
                title="Remove this view from the explorer">
            <i class="fas fa-times"></i>
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
            'hasImageSequences',
            'isReviewing',
            'projectConfig',
            'hasAnnotationProperties',
            'hasOnlineUsers'
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
