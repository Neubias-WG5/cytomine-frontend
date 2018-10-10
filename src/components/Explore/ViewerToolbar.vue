<template>
    <div class="toolbar-annotations btn-toolbar" role="toolbar">
        <div class="btn-group" role="group">
            <template v-if="mustBeShown('project-tools-select')">
                <button :class="['btn', 'btn-default', 'btn-xs', {active: activeTool == 'Select'}]"
                        @click="setInteraction('Select')" title="Select an annotation">
                    <i class="fas fa-mouse-pointer"></i>
                    Select
                </button>
            </template>
            <template v-if="isDrawable && !isReviewing">
                <template v-if="mustBeShown('project-tools-point')">
                    <button
                        :class="['btn', 'btn-default', 'btn-xs', {active: activeTool == 'Point'}, {disabled: !canDraw}]"
                        @click="setInteraction('Point')" title="Add a point as new annotation">
                        <i class="fas fa-map-marker-alt"></i>
                        Point
                    </button>
                </template>
                <template v-if="mustBeShown('project-tools-line')">
                    <button
                        :class="['btn', 'btn-default', 'btn-xs', {active: activeTool == 'Line'}, {disabled: !canDraw}]"
                        @click="setInteraction('Line')" title="Add a line as new annotation">
                        <i class="fas fa-minus"></i>
                        Line
                    </button>
                </template>
                <template v-if="mustBeShown('project-tools-arrow')">
                    <button
                        :class="['btn', 'btn-default', 'btn-xs', {active: activeTool == 'Arrow'}, {disabled: !canDraw}]"
                        @click="setInteraction('Arrow')" title="Add an arrow as new annotation">
                        <i class="fas fa-long-arrow-alt-right"></i>
                        Arrow
                    </button>
                </template>
                <template v-if="mustBeShown('project-tools-rectangle')">
                    <button
                        :class="['btn', 'btn-default', 'btn-xs', {active: activeTool == 'Rectangle'}, {disabled: !canDraw}]"
                        @click="setInteraction('Rectangle')" title="Add a rectangle as new annotation">
                        <i class="fas fa-vector-square"></i>
                        Rectangle
                    </button>
                </template>
                <template v-if="mustBeShown('project-tools-diamond')">
                    <button
                        :class="['btn', 'btn-default', 'btn-xs', {active: activeTool == 'Ellipse'}, {disabled: !canDraw}]"
                        @click="setInteraction('Ellipse')" title="Add an ellipse as new annotation">
                        Ellipse
                    </button>
                </template>
                <template v-if="mustBeShown('project-tools-circle')">
                    <button
                        :class="['btn', 'btn-default', 'btn-xs', {active: activeTool == 'Circle'}, {disabled: !canDraw}]"
                        @click="setInteraction('Circle')" title="Add a circle as new annotation">
                        <i class="far fa-circle"></i>
                        Circle
                    </button>
                </template>
                <template v-if="mustBeShown('project-tools-polygon')">
                    <button
                        :class="['btn', 'btn-default', 'btn-xs', {active: activeTool == 'Polygon'}, {disabled: !canDraw}]"
                        @click="setInteraction('Polygon')" title="Add a polygon as new annotation">
                        <i class="fas fa-draw-polygon"></i>
                        Polygon
                    </button>
                </template>
                <!-- <template v-if="mustBeShown('project-tools-magicwand')"> TODO MAGICWAND
                    <button :class="['btn', 'btn-default', 'btn-xs', {active: activeTool == 'MagicWand'}]"
                    @click="setInteraction('MagicWand')" title="Add a new annotation with magic wand">
                        <i class="fas fa-magic"></i>
                        MagicWand
                    </button>
                </template> -->
                <template v-if="mustBeShown('project-tools-freehand')">
                    <button
                        :class="['btn', 'btn-default', 'btn-xs', {active: activeTool == 'Freehand'}, {disabled: !canDraw}]"
                        @click="setInteraction('Freehand')" title="Add a new annotation with freehand draw">
                        <i class="fas fa-pencil-alt"></i>
                        Freehand
                    </button>
                </template>
            </template>
            <template v-if="isDrawable">
                <template v-if="mustBeShown('project-tools-union')">
                    <button
                        :class="['btn', 'btn-default', 'btn-xs', {active: activeTool == 'Union'}, {disabled: !canDraw}]"
                        @click="setInteraction('Union')" title="Correct an annotation by adding a freehand area">
                        <!--<i class="far fa-object-group"></i>-->
                        <i class="fas fa-pencil-alt"></i>
                        <i class="far fa-plus-square"></i>
                    </button>
                </template>
                <template v-if="mustBeShown('project-tools-difference')">
                    <button
                        :class="['btn', 'btn-default', 'btn-xs', {active: activeTool == 'Difference'}, {disabled: !canDraw}]"
                        @click="setInteraction('Difference')" title="Correct an annotation by removing a freehand area">
                        <!--<i class="far fa-object-ungroup"></i>-->
                        <i class="fas fa-pencil-alt"></i>
                        <i class="far fa-minus-square"></i>
                    </button>
                </template>
            </template>

            <div class="btn-group" role="group">
                <dropdown v-if="mustBeShown('project-tools-rule') || mustBeShown('project-tools-area')
                || mustBeShown('project-tools-screenshot')">
                    <button :class="['btn', 'btn-default', 'btn-xs', {active: activeTool == 'Ruler' || activeTool == 'Area'
                || activeTool == 'Screenshot'}]"><i class="fas fa-ellipsis-h"></i> <span class="caret"></span></button>
                    <template slot="dropdown">
                        <template v-if="mustBeShown('project-tools-rule')">
                            <li :class="[{active: activeTool == 'Ruler'}]">
                                <a role="button" style="cursor: pointer;" @click="setInteraction('Ruler')">
                                    <i class="fas fa-ruler-horizontal"></i> Measure length
                                </a>
                            </li>
                        </template>
                        <template v-if="mustBeShown('project-tools-area')">
                            <li :class="[{active: activeTool == 'Area'}]">
                                <a role="button" style="cursor: pointer;" @click="setInteraction('Area')">
                                    <i class="fas fa-ruler-combined"></i> Measure area
                                </a>
                            </li>
                        </template>
                        <template v-if="mustBeShown('project-tools-screenshot')">
                            <li :class="[{active: activeTool == 'Screenshot'}]">
                                <a role="button" style="cursor: pointer;" @click="setInteraction('Screenshot')">
                                    <i class="fas fa-camera-retro"></i> Screenshot
                                </a>
                            </li>
                        </template>
                    </template>
                </dropdown>
            </div>
        </div>

        <template v-if="selectedAnnotation && isEditable">
            <div class="btn-group" role="group">
                <template v-if="mustBeShown('project-tools-fill') && canFill">
                    <button :class="['btn', 'btn-default', 'btn-xs', {active: activeTool == 'Fill'}]"
                            @click="setInteraction('Fill')" title="Fill holes in the selected annotation">
                        <i class="fas fa-fill"></i>
                        Fill
                    </button>
                </template>
                <template v-if="mustBeShown('project-tools-edit') && canEdit">
                    <button :class="['btn', 'btn-default', 'btn-xs', {active: activeTool == 'Edit'}]"
                            @click="setInteraction('Edit')" title="Edit geometry of the selected annotation">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                </template>
                <template v-if="mustBeShown('project-tools-rotate') && canRotate">
                    <button :class="['btn', 'btn-default', 'btn-xs', {active: activeTool == 'Rotate'}]"
                            @click="setInteraction('Rotate')" title="Rotate the selected annotation">
                        <i class="fas fa-redo-alt"></i>
                        Rotate
                    </button>
                </template>
                <!-- <template v-if="mustBeShown('project-tools-resize') && canResize> TODO RESIZE
                    <button :class="['btn', 'btn-default', 'btn-xs', {active: activeTool == 'Resize'}]"
                    @click="setInteraction('Resize')" title="Resize the selected annotation">
                        <span class="glyphicon glyphicon-resize-full"></span>
                        Resize
                    </button>
                </template> -->
                <template v-if="mustBeShown('project-tools-move')">
                    <button :class="['btn', 'btn-default', 'btn-xs', {active: activeTool == 'Drag'}]"
                            @click="setInteraction('Drag')" title="Drag the selected annotation">
                        <i class="fas fa-arrows-alt"></i>
                        Drag
                    </button>
                </template>
                <template v-if="mustBeShown('project-tools-delete')">
                    <button :class="['btn', 'btn-default', 'btn-xs', {active: activeTool == 'Remove'}]"
                            @click="setInteraction('Remove')" title="Delete the selected annotation (irreversible !)">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </template>
            </div>
        </template>
    </div>
</template>

<script>
    import mustBeShown from '../../helpers/mustBeShown';
    import {Dropdown} from 'uiv'

    export default {
        name: "ViewerToolbar",
        components: {
            Dropdown
        },
        props: [
            'project',
            'projectConfig',
            'currentUser',
            'activeTool',
            'selectedAnnotation',
            'drawableLayerIds',
            'isReviewing'
        ],
        data() {
            return {}
        },
        computed: {
            isDrawable() {
                return !this.project.isReadOnly
                    || this.project.admins.findIndex(item => item.id === this.currentUser.id) != -1;
            },
            isEditable() {
                return this.selectedAnnotation.class != "be.cytomine.ontology.AlgoAnnotation"
                    && (this.project.admins.findIndex(item => item.id === this.currentUser.id) != -1
                        || (!this.project.isReadOnly && !this.project.isRestricted)
                        || (this.currentUser.id == this.selectedAnnotation.user && this.project.isRestricted));
            },
            canEdit() {
                return !this.selectedAnnotation.location.includes("POINT");
            },
            canRotate() {
                return !this.selectedAnnotation.location.includes("POINT");
            },
            canResize() {
                return !this.selectedAnnotation.location.includes("POINT");
            },
            canFill() {
                return !this.selectedAnnotation.location.includes("POINT")
                    && !this.selectedAnnotation.location.includes("LINESTRING");
            },
            canDraw() {
                return this.drawableLayerIds.length > 0
            }
        },
        methods: {
            setInteraction(interaction) {
                this.$emit('update:activeTool', interaction)
            },
            mustBeShown(key) {
                return mustBeShown(key, this.projectConfig);
            },
        }
    }
</script>

<style scoped>
    .toolbar-annotations {
        display: flex;
        flex-wrap: wrap;
        position: absolute;
        top: 1em;
        left: 67px;
        list-style: none;
        padding: 0;
        margin-right: 235px;
    }

    .btn-group .btn .disabled {
        background-color: white;
    }
</style>
