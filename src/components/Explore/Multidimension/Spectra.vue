<template>
    <div v-if="spectra != {} && hdf5.status == 3">
        <div>
            <h4>Spectral distribution</h4>
            <div class="alert alert-info" v-if="position.length == 0">
                Click in the image to see the spectral distribution at given position.
            </div>
            <div :id="'spectra-'+currentMap.id"></div>
        </div>
    </div>
</template>

<script>
import Plotly from 'plotly.js/lib/core';

export default {
    name: 'Spectra',
    props: [
        'currentMap',
        'imageSequence',
        'imageGroup',
        'mousePosition'
    ],
    data() {
        return {
            spectra: {},
            hdf5: {},
            yAxis: [],
            position: []
        }
    },
    computed: {
        xAxis() {
            if (this.imageGroup.channel.length <= 1 && this.imageGroup.zStack.length <= 1)
                return {values: this.imageGroup.time, legend: 'Time frame (t)'};
            else if (this.imageGroup.channel.length <= 1 && this.imageGroup.time.length <= 1)
                return {values: this.imageGroup.zStack, legend: 'Slice (z)'};
            else
                return {values: this.imageGroup.channel, legend: 'Channel (c)'}
        },
    },
    methods: {
        updateSpectra(spectrum = this.yAxis) {
            let xAxis = this.xAxis;
            let trace = {
                x: xAxis.values,
                y: spectrum,
                type: 'scatter',
            };
            let layout = {
                title: `Spectral distribution for ${xAxis.legend.toLowerCase()}`,
                xaxis: {
                    title: xAxis.legend,
                    showgrid: true,
                    tickformat: "",
                },
                yaxis: {
                    title: 'Pixel value',
                    showgrid: true,
                    tickformat: "",
                }
            };
            Plotly.react('spectra-'+this.currentMap.id, [trace], layout)
        },
        getPixelData(event) {
            let coord = this.$openlayers.getMap(this.currentMap.id).getCoordinateFromPixel(this.mousePosition);
            if (coord[0] > 0 && coord[0] < this.currentMap.data.width
                && coord[1] > 0 && coord[1] < this.currentMap.data.height) {
                this.position = coord.map(value => Math.round(value));

                let x = this.position[0];
                let y = this.currentMap.data.height - this.position[1];
                api.get(`/api/imagegroupHDF5/${this.hdf5.id}/${x}/${y}/pixel.json`).then(response => {
                    this.yAxis = response.data.spectra;
                    this.updateSpectra();
                })
            }
        }
    },
    created() {
        api.get(`/api/imagegroup/${this.imageGroup.id}/imagegroupHDF5.json`).then(response => {
            this.hdf5 = response.data;
            this.$openlayers.getMap(this.currentMap.id).on('click', this.getPixelData)
        })
    },
}
</script>
