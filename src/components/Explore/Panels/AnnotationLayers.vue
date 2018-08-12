<template>
    <section>
        <h4>Layers</h4>
        <div class="btn-group" style="display:flex;">
            <select class="btn btn-default" v-model="layerToBeAdded" name="user-layer" id="user-layer"
                    style="width: 100%;">
                <option :value="{}">Choose an annotation layer</option>
                <option v-for="layer in notSelectedLayersSorted" :key="layer.id" :value="layer">
                    {{userDisplayName(layer)}}
                </option>
            </select>
            <button class="btn btn-default" @click="addLayer()">Add</button>
        </div>
        <ul class="list-group mt-4">
            <li class="list-group-item clearfix" v-for="layer in selectedLayers" :key="layer.id" v-if="layer.selected">
                {{userDisplayName(layer)}}
                <div class="pull-right">
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

                    <div class="btn-group" role="group">
                        <button :class="['btn', 'btn-default', 'btn-xs', {active: layer.visible}]"
                                @click="toggleVisibility(layer)" title="Show annotations from this layer">
                            <i class="fas fa-eye"></i>
                            Show
                        </button>
                        <button :class="['btn', 'btn-default', 'btn-xs', {active: layer.drawable}]"
                                :disabled="!isEditable(layer) || layer.id != currentUser.id"
                                title="Add new annotations in this layer" @click="toggleDrawability(layer)">
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
        <!--<div>-->
        <!--<label for="layers-opacity">Layers opacity</label>-->
        <!--<input v-model.number="vectorLayersOpacity" min="0" max="1" step="0.01" type="range" name="layers-opacity"-->
        <!--id="layers-opacity">-->
        <!--</div>-->
    </section>
</template>

<script>

    export default {
        name: 'AnnotationLayers',
        props: [
            'viewerId',
            // 'isReviewing',
            'project',
            'userLayers',
            'currentUser'
        ],
        data() {
            return {
                layerToBeAdded: {},

                // vectorLayer: {},
                // reviewedLayer: {},
                // intervalId: '',
                // showReviewLayer: true,
                // toAdd: {},
            }
        },
        computed: {
            layers() {
                return this.userLayers
            },
            selectedLayers() {
                return this.layers.filter(item => item.selected)
            },
            notSelectedLayers() {
                return this.layers.filter(item => !item.selected)
            },
            notSelectedLayersSorted() {
                let users = this.notSelectedLayers.filter(item => !item.algo).sort((a, b) => {
                    return this.userDisplayName(a).toLowerCase().localeCompare(this.userDisplayName(b).toLowerCase())
                });

                let algos = this.notSelectedLayers.filter(item => item.algo).sort((a, b) => {
                    return this.userDisplayName(a).toLowerCase().localeCompare(this.userDisplayName(b).toLowerCase())
                });

                return users.concat(algos)
            }
        },
        watch: {},
        methods: {
            addLayer() {
                let index = this.layers.findIndex(l => l.id == this.layerToBeAdded.id);
                this.layerToBeAdded.selected = true;
                this.$emit('updateLayer', {
                    'index': index,
                    'layer': this.layerToBeAdded
                });
                this.layerToBeAdded = {};
            },
            toggleVisibility(layer) {
                let index = this.layers.findIndex(l => l.id == layer.id);
                layer.visible = !layer.visible;
                this.$emit('updateLayer', {
                    'index': index,
                    'layer': layer
                })
            },
            toggleDrawability(layer) {
                let index = this.layers.findIndex(l => l.id == layer.id);
                layer.drawable = !layer.drawable;
                this.$emit('updateLayer', {
                    'index': index,
                    'layer': layer
                })
            },
            toggleSelection(layer) {
                let index = this.layers.findIndex(l => l.id == layer.id);
                layer.selected = !layer.selected;
                this.$emit('updateLayer', {
                    'index': index,
                    'layer': layer
                })
            },
            isEditable(layer) {
                return !layer.algo
                    && (this.project.admins.findIndex(item => item.id === this.currentUser.id) != -1
                        || (!this.project.isReadOnly && !this.project.isRestricted)
                        || (this.currentUser.id == layer.id && this.project.isRestricted));
            },
            userDisplayName(layer) {
                if (layer.algo) {
                    return `${layer.softwareName} (${layer.username}) (${layer.size == undefined ? '0' : layer.size})`;
                } else if (layer.lastname == undefined && layer.firstname == undefined) {
                    return `(${layer.username}) (${layer.size == undefined ? '0' : layer.size})`;
                } else {
                    return `${layer.lastname} ${layer.firstname} (${layer.username}) (${layer.size == undefined ? '0' : layer.size})`;
                }
            },
            // vectorLoader(extent, resolution, projection) {
            //     api.get(`/api/annotation.json?&user=${this.toAdd.id}&image=${this.image.id}&showWKT=true&showTerm=true&notReviewedOnly=${this.isReviewing}&kmeans=true&bbox=${extent.join(',')}`).then(data => {
            //         let geoms = this.createFeatures(data.data.collection, this.toAdd.id);
            //         this.loadFeatures(geoms);
            //     })
            // },
            // reviewLoader(extent, resolution, projection) {
            //     this.userLayers.map(user => {
            //         api.get(`/api/annotation.json?&user=${user.id}&image=${this.image.id}&roi=false&notReviewedOnly=true&reviewed=true&showWKT=true&showTerm=true&kmeans=true&bbox=${extent.join(',')}`).then(resp => {
            //             let collection = resp.data.collection;
            //             let geoms = this.createFeatures(collection, user.id, true);
            //             this.loadFeatures(geoms, true)
            //         })
            //     })
            // },
            // loadFeatures(collection, areReviewed = false) {
            //     if (areReviewed) {
            //         this.reviewedLayer.getSource().addFeatures(collection);
            //     } else {
            //         this.vectorLayer.getSource().addFeatures(collection);
            //     }
            // },
            //
            // removeLayer(toRemoveId, removeFromSelected = true) {
            //     let index;
            //
            //     if (removeFromSelected) {
            //         index = this.layersSelected.findIndex(layer => {
            //             return layer.id === toRemoveId;
            //         });
            //         // Removes the layer from the selected
            //         this.layersSelected.splice(index, 1);
            //     }
            //
            //     // Removes layer from the map
            //     index = this.layerIndex(this.layersArray, toRemoveId);
            //     if (index < 0) return;
            //
            //     this.layersArray.splice(index, 1);
            //     this.$openlayers.getMap(this.viewerId).render();
            // },
            //
            // followUser(userId) {
            //     let index = this.userToFollow.findIndex(user => user == userId);
            //
            //     if (index > 0) {
            //         this.userToFollow = [];
            //         clearInterval(this.intervalId);
            //     } else {
            //         this.userToFollow = [userId];
            //         this.intervalId = setInterval(this.setUserPosition, 1000);
            //     }
            // },
            // setUserPosition() {
            //     api.get(`/api/imageinstance/${this.image.id}/position/${this.userToFollow[0]}.json`).then(data => {
            //         let {x, y, zoom} = data.data;
            //         this.$openlayers.getView(this.viewerId).setCenter([x, y]);
            //         this.$openlayers.getView(this.viewerId).setZoom(zoom);
            //     })
            // },
            // isUserOnline(userId) {
            //     let index = this.onlineUsers.findIndex(user => user.id == userId);
            //     return index > 0 ? false : true;
            // },
            // refreshAnnotationsIndex() {
            //     api.get(`/api/imageinstance/${this.image.id}/annotationindex.json`).then(data => {
            //         this.userLayers.map((layer, index) => {
            //             let annotIndex = data.data.collection.find(index => layer.id === index.user);
            //             this.userLayers[index].size = (annotIndex) ? annotIndex.countAnnotation : 0;
            //         });
            //
            //         this.layersSelected.map((layer, index) => {
            //             let userLayer = this.userLayers.find(item => layer.id == item.id);
            //             layer.size = userLayer.size;
            //             this.$set(this.layersSelected, index, layer);
            //             return layer;
            //         })
            //     })
            // },
            //
        }
    }
</script>

<style scoped>
    .display-inline-block {
        display: inline-block;
    }
</style>
