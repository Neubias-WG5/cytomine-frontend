<template>
    <div v-if="imageGroup.hdf5 && imageGroup.hdf5.status == 3">
        <div>
            <h4>Spectral distribution</h4>
            <div class="text-center">
                <button class="btn btn-default" @click="active=!active">
                    <span v-if="!active"><i class="fas fa-chart-area"></i> Activate spectrum computation on click</span>
                    <span v-else><i class="fas fa-hand-paper"></i> Deactivate spectrum computation on click</span>
                </button>
            </div>
            <plotly-line-chart :chart="chart" v-if="active"></plotly-line-chart>
            <div class="text-center" v-if="active && traces.length > 0">
                <button class="btn btn-default btn-xs" @click="traces.splice(0, traces.length)">Remove all traces</button>
            </div>
        </div>
    </div>
</template>

<script>
    import PlotlyLineChart from "../../../PlotlyLineChart";
    import uuid from 'uuid';

    export default {
        name: 'Spectrum',
        components: {
            PlotlyLineChart
        },
        props: [
            'coordinates',
            'imageGroup',
            'elementWidth'
            // 'imageSequence',
        ],
        data() {
            return {
                active: false,
                uuid: uuid(),
                traces: []
            }
        },
        computed: {
            chart() {
                return {
                    uuid: this.uuid,
                    traces: this.traces,
                    layout: {
                        legend:{
                            orientation: "h"
                        },
                        width: this.elementWidth * 0.7,
                        xaxis: {
                            title: this.xTitle
                        },
                        yaxis: {
                            title: ''
                        }
                    }
                }
            },
            xAxis() {
                if (this.imageGroup.channels.length <= 1 && this.imageGroup.zStacks.length <= 1)
                    return this.imageGroup.times;
                else if (this.imageGroup.channels.length <= 1 && this.imageGroup.times.length <= 1)
                    return this.imageGroup.zStacks;
                else
                    return this.imageGroup.channels;
            },
            xTitle() {
                if (this.imageGroup.channels.length <= 1 && this.imageGroup.zStacks.length <= 1)
                    return 'Time frame (t)';
                else if (this.imageGroup.channels.length <= 1 && this.imageGroup.times.length <= 1)
                    return 'Slice (z)';
                else
                    return 'Channel (c)'
            }
        },
        watch: {
            imageGroup: {
                handler() {
                    this.traces.splice(0, this.traces.length)
                },
                deep : true
            },
            coordinates: {
                handler(newCoordinates) {
                    if (this.active && newCoordinates) {
                        this.createTrace(newCoordinates)
                    }
                },
                deep: true
            },
            active() {
                this.$emit('activeStateChanged')
            }
        },
        methods: {
            createTrace(coordinates) {
                let x = Math.round(coordinates[0]);
                let y = Math.round(coordinates[1]);
                return api.get(`/api/imagegroupHDF5/${this.imageGroup.hdf5.id}/${x}/${y}/pixel.json`).then(response => {
                    let trace = {
                        id: uuid(),
                        type: 'scatter',
                        showlegend: true,
                        name: `[x: ${x}; y: ${y}]`,
                        x: this.xAxis,
                        y:response.data.spectra,
                        mode: 'lines+markers',
                    };
                    this.traces.push(trace)
                })
            }
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
