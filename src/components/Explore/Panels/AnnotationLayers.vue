<template>
    <section>
        <h4><i class="fas fa-layer-group"></i> Layers</h4>
        <div class="btn-group" style="display:flex;">
            <select class="btn btn-default" v-model="layerToBeAdded" name="user-layer" id="user-layer"
                    style="width: 100%;">
                <option :value="{}">Choose an annotation layer</option>
                <option v-for="layer in notSelectedLayersSorted" :key="layer.id" :value="layer">
                    {{userDisplayName(layer)}}
                </option>
            </select>
            <button class="btn btn-default" @click="addLayer()">Add</button>
            <button class="btn btn-default" @click="addAllLayers()" v-if="notSelectedLayers.length < 10">Add all</button>
        </div>
        <ul class="list-group mt-4">
            <li class="list-group-item clearfix" v-for="layer in selectedLayersSorted" :key="layer.id" v-if="layer.selected">
                {{userDisplayName(layer)}}
                <div class="pull-right">
                    <template v-if="!isReviewing">
                        <template v-if="isEditable(layer)">
                    <span class="label label-success" style="margin: 2px;">
                        <i class="fas fa-check-circle"></i>
                        Editable
                    </span>
                        </template>
                        <template v-else>
                    <span class="label label-danger" style="margin: 2px;">
                        <i class="fas fa-times-circle"></i>
                        Read-only
                    </span>
                        </template>
                    </template>


                    <div class="btn-group" role="group">
                        <button :class="['btn', 'btn-default', 'btn-xs', {active: layer.visible}]"
                                @click="toggleVisibility(layer)" title="Show annotations from this layer">
                            <i class="fas fa-eye"></i>
                            Show
                        </button>
                        <button :class="['btn', 'btn-default', 'btn-xs', {active: layer.drawable}]"
                                :disabled="!isEditable(layer)"
                                title="Add new annotations in this layer" @click="toggleDrawability(layer)"
                                v-if="!isReviewing">
                            <i class="fas fa-drafting-compass"></i>
                            Draw
                        </button>
                        <button class="btn btn-default btn-xs" @click="toggleSelection(layer)"
                                title="Remove this layer from the view">
                            <i class="fas fa-times"></i>
                            Remove
                        </button>
                    </div>
                </div>
            </li>
        </ul>

        <div class="flex">
            <div class="input-group" style="margin-right: 5px;">
                <span class="input-group-addon">Layer opacity</span>
                <input class="form-control" :value="parseInt(layerOpacity * 100)"
                       @input="$emit('update:layerOpacity', parseFloat($event.target.value / 100))"
                       type="number" step="1" :max="100" :min="0" name="layers-opacity" id="layers-opacity">
                <span class="input-group-addon">%</span>
            </div>
            <input class="range" :value="layerOpacity"
                   @input="$emit('update:layerOpacity', parseFloat($event.target.value))"
                   type="range" step="0.01" :max="1" :min="0">
        </div>
    </section>
</template>

<script>

    export default {
        name: 'AnnotationLayers',
        props: [
            'viewerId',
            'isReviewing',
            'project',
            'userLayers',
            'currentUser',
            'showReview',
            'layerOpacity'
        ],
        data() {
            return {
                layerToBeAdded: {},
            }
        },
        computed: {
            layers() {
                if (this.showReview)
                    return this.userLayers;
                else
                    return this.userLayers.filter(item => !item.review)
            },
            selectedLayers() {
                return this.layers.filter(item => item.selected)
            },
            selectedLayersSorted() {
                return this.sortLayers(this.selectedLayers);
            },
            notSelectedLayers() {
                return this.layers.filter(item => !item.selected)
            },
            notSelectedLayersSorted() {
                return this.sortLayers(this.notSelectedLayers)
            }
        },
        watch: {},
        methods: {
            sortLayers(layers) {
                let users = layers.filter(item => !item.algo && !item.review).sort((a, b) => {
                    return this.userDisplayName(a).toLowerCase().localeCompare(this.userDisplayName(b).toLowerCase())
                });

                let algos = layers.filter(item => item.algo && !item.review).sort((a, b) => {
                    return this.userDisplayName(a).toLowerCase().localeCompare(this.userDisplayName(b).toLowerCase())
                });

                let review = layers.filter(item => item.review);

                return review.concat(users.concat(algos))
            },
            addLayer(layer = this.layerToBeAdded) {
                if (layer.id == undefined)
                    return;

                let index = this.userLayers.findIndex(l => l.id == layer.id);
                layer.selected = true;
                layer.visible = true;
                this.$emit('updateLayer', {
                    'index': index,
                    'layer': layer
                });
                this.layerToBeAdded = {};
            },
            addAllLayers() {
                let layers = this.notSelectedLayersSorted;
                layers.forEach(layer => {
                    this.addLayer(layer)
                })
            },
            toggleVisibility(layer) {
                let index = this.userLayers.findIndex(l => l.id == layer.id);
                layer.visible = !layer.visible;
                this.$emit('updateLayer', {
                    'index': index,
                    'layer': layer
                })
            },
            toggleDrawability(layer) {
                let index = this.userLayers.findIndex(l => l.id == layer.id);
                layer.drawable = !layer.drawable;
                this.$emit('updateLayer', {
                    'index': index,
                    'layer': layer
                })
            },
            toggleSelection(layer) {
                let index = this.userLayers.findIndex(l => l.id == layer.id);
                layer.selected = !layer.selected;
                this.$emit('updateLayer', {
                    'index': index,
                    'layer': layer
                })
            },
            isEditable(layer) {
                return !layer.algo && !layer.review
                    && (this.project.admins.findIndex(item => item.id === this.currentUser.id) != -1
                        || (!this.project.isReadOnly && !this.project.isRestricted)
                        || (this.currentUser.id == layer.id && this.project.isRestricted));
            },
            userDisplayName(layer) {
                if (layer.review) {
                    return `Review layer (${layer.size == undefined ? '0' : layer.size})`;
                } else if (layer.algo) {
                    return `${layer.softwareName} (${layer.username}) (${layer.size == undefined ? '0' : layer.size})`;
                } else if (layer.lastname == undefined && layer.firstname == undefined) {
                    return `(${layer.username}) (${layer.size == undefined ? '0' : layer.size})`;
                } else {
                    return `${layer.lastname} ${layer.firstname} (${layer.username}) (${layer.size == undefined ? '0' : layer.size})`;
                }
            },
        }
    }
</script>

<style scoped>
    .display-inline-block {
        display: inline-block;
    }

    .flex {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .input-group {
        max-width: 250px;
    }

    .range {
        width: auto;
    }
</style>
