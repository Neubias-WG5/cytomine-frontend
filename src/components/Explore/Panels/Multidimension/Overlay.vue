<template>
  <div v-if="imageGroup.channels && imageGroup.channels.length > 1">
      <h4>Overlay</h4>
      <ul class="list-group mt-4">
          <li class="list-group-item clearfix" v-for="overlay in overlays" :key="overlay.channel">
              Channel {{overlay.channel}} - COLOR -
              <div class="pull-right">
                  <div class="btn-group" role="group">
                      <button :class="['btn', 'btn-default', 'btn-xs', {active: overlay.visible}]"
                              @click="toggleVisibility(overlay)">
                          <i class="fas fa-eye"></i>
                          Show
                      </button>
                      <button class="btn btn-default btn-xs" @click="removeOverlay(overlay)">
                          <i class="fas fa-times"></i>
                          Remove
                      </button>
                  </div>
              </div>
          </li>
          <li class="list-group-item clearfix" v-if="overlays.length < imageGroup.channels.length">
              <div class="form-inline" style="display: flex;justify-content: space-around">
                  <div class="form-group">
                      <label>Channel</label>
                      <select class="form-control input-sm"><option>1</option></select>
                  </div>
                  <div class="form-group">
                      <label>Color</label>
                      <div class="form-control input-sm" style="width:60px;cursor: pointer"></div>
                  </div>
                      <div class="btn-group" role="group">
                          <button class="btn btn-default btn-sm" @click="addOverlay()">
                              <i class="fas fa-plus"></i>
                              Add
                          </button>
                      </div>
              </div>

          </li>
      </ul>














      <!--<ul>-->
            <!--<li v-for="overlay in overlayedLayer" :key="overlay.id">-->
              <!--<button @click="removeOverlay(overlay)">Remove</button>-->
              <!--Channel{{overlay.channel}}-->
              <!--<input @change="setOverlayColor(overlay)" type="text" placeholder="Color">-->
              <!--<input @input="setOverlayOpacity($event, overlay)" type="range" step="0.1" min="0" max="1">-->
            <!--</li>-->
      <!--</ul>-->
      <!--<div>-->
        <!--<label :for="'overlay-' + currentMap.id">Choose a channel to add as an overlay</label>-->
      <!--</div>-->
      <!--<div class="overlay-select">-->
        <!--<input v-model.number="sequenceSelected" type="number" :name="'overlay-' + currentMap.id" :id="'overlay-' + currentMap.id">-->
        <!--<input v-model.number="sequenceSelected" type="range" step="1" min="1" :max="imageGroup.length">-->
      <!--</div>-->
      <!--<button class="btn btn-default mt-4" @click="addOverlay">Add as an overlay</button>-->
  </div>
</template>

<script>
import { Sketch } from 'vue-color';

export default {
    name: 'Overlay',
    components: {
        'sketch-picker': Sketch,
    },
    props: [
        'imageSequence',
        'imageGroup',
    ],
    data() {
        return {
            overlays: [],

        }
    },
    methods: {
        // addOverlay() {
        //     let layersArray = this.$openlayers.getMap(this.currentMap.id).getLayers().getArray();
        //     let vectorIndex = layersArray.findIndex(layer => layer.getType() == 'VECTOR');
        //     let imageToAdd = this.imageGroup[this.sequenceSelected - 1];
        //
        //     api.get(`/api/abstractimage/${imageToAdd.model.baseImage}/imageservers.json?&imageinstance=${imageToAdd.image}`).then(data => {
        //         let layerToAdd = new OlTile({
        //             source: new Zoomify({
        //                 url: `${this.filterUrl}${data.data.imageServersURLs}&tileGroup={TileGroup}&z={z}&x={x}&y={y}&channels=0&layer=0&timeframe=0&mimeType=${imageToAdd.model.mime}`,
        //                 size: [parseInt(imageToAdd.model.width), parseInt(imageToAdd.model.height)],
        //                 extent: [0, 0, parseInt(imageToAdd.model.width), parseInt(imageToAdd.model.height)],
        //             }),
        //             extent: [0, 0, parseInt(imageToAdd.model.width), parseInt(imageToAdd.model.height)],
        //         })
        //
        //         layerToAdd.set('channel', imageToAdd.channel);
        //
        //         if(vectorIndex > 0) {
        //             layersArray.splice(vectorIndex, 0, layerToAdd);
        //         } else {
        //             layersArray.push(layerToAdd);
        //         }
        //
        //         this.overlayedLayer.push(imageToAdd);
        //
        //         this.$openlayers.getMap(this.currentMap.id).setLayerGroup(new Group({layers: layersArray}))
        //     })
        //
        // },
        // removeOverlay(overlay) {
        //     let layersArray = this.$openlayers.getMap(this.currentMap.id).getLayers().getArray();
        //     let index = layersArray.findIndex(layer => layer.get('channel') == overlay.channel);
        //     layersArray.splice(index, 1);
        //     this.$openlayers.getMap(this.currentMap.id).setLayerGroup(new Group({layers: layersArray}));
        //     index = this.overlayedLayer.findIndex(item => overlay == item);
        //     this.overlayedLayer.splice(index, 1);
        // },
        // setOverlayColor(overlay) {
        //     //
        // },
        // setOverlayOpacity(evt, overlay) {
        //     let opacity = evt.target.value;
        //     let layersArray = this.$openlayers.getMap(this.currentMap.id).getLayers().getArray();
        //     let index = layersArray.findIndex(layer => layer.get('channel') == overlay.channel);
        //
        //     layersArray[index].setOpacity(opacity);
        // }
    }
}
</script>

<style>
    .overlay-select {
        display: flex;
    }
</style>
