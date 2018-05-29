<template>
  <div>
      <div style="float: left;">x: {{currentCoordinate[0]}}</div>
      <div style="float: right;">y: {{currentCoordinate[1]}}</div>
  </div>
</template>

<script>
export default {
  name: 'Position',
  props: [
      'currentMapId',
      'mousePosition'
  ],
  computed: {
      currentCoordinate() {
          if(this.$openlayers.getMap(this.currentMapId) !== undefined) {
              let coord = this.$openlayers.getMap(this.currentMapId).getCoordinateFromPixel(this.mousePosition);
              return coord.map(value => Math.round(value * 10) / 10);
          } else {
              return this.mousePosition;
          }
      }
  },
}
</script>
