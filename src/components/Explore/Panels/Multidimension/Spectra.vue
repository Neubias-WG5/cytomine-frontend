<template>
    <div v-if="imageGroup.hdf5 && imageGroup.hdf5.status == 3">
        <div>
            <h4>Spectral distribution</h4>
            <div class="text-center">
                <button class="btn btn-default" @click="active=!active">
                    <span v-if="active">Show</span><span v-else>Hide</span> spectrum on click
                </button>
            </div>
            <div v-if="active" :id="'spectrum-'+currentMap.id"></div>
        </div>
    </div>
</template>

<script>
import Plotly from 'plotly.js/lib/core';

export default {
    name: 'Spectra',
    props: [
        'coordinates',
        'imageGroup',
        'imageSequence'
    ],
    data() {
        return {
            active: false,
            yAxis: [],
        }
    },
    computed: {
        xAxis() {
            if (this.imageGroup.channels.length <= 1 && this.imageGroup.zStacks.length <= 1)
                return {values: this.imageGroup.times, legend: 'Time frame (t)'};
            else if (this.imageGroup.channels.length <= 1 && this.imageGroup.times.length <= 1)
                return {values: this.imageGroup.zStacks, legend: 'Slice (z)'};
            else
                return {values: this.imageGroup.channels, legend: 'Channel (c)'}
        },
    },
    asyncComputed: {
        spectrum() {
            let x = this.coordinates[0];
            let y = this.coordinates[1];
            return api.get(`/api/imagegroupHDF5/${this.imageGroup.hdf5.id}/${x}/${y}/pixel.json`).then(response => {
                return response.data.spectra;
            })
        }
    },
    methods: {
        // updateSpectra(spectrum = this.yAxis) {
        //     let xAxis = this.xAxis;
        //     let trace = {
        //         x: xAxis.values,
        //         y: spectrum,
        //         type: 'scatter',
        //     };
        //     let layout = {
        //         title: `Spectral distribution for ${xAxis.legend.toLowerCase()}`,
        //         xaxis: {
        //             title: xAxis.legend,
        //             showgrid: true,
        //             tickformat: "",
        //         },
        //         yaxis: {
        //             title: 'Pixel value',
        //             showgrid: true,
        //             tickformat: "",
        //         }
        //     };
        //     Plotly.react('spectra-'+this.currentMap.id, [trace], layout)
        // },
        // getPixelData(event) {
        //     let coord = this.$openlayers.getMap(this.currentMap.id).getCoordinateFromPixel(this.mousePosition);
        //     if (coord[0] > 0 && coord[0] < this.currentMap.data.width
        //         && coord[1] > 0 && coord[1] < this.currentMap.data.height) {
        //         this.position = coord.map(value => Math.round(value));
        //
        //         let x = this.position[0];
        //         let y = this.currentMap.data.height - this.position[1];
        //         api.get(`/api/imagegroupHDF5/${this.hdf5.id}/${x}/${y}/pixel.json`).then(response => {
        //             this.yAxis = response.data.spectra;
        //             this.updateSpectra();
        //         })
        //     }
        // }
    },
}
</script>
