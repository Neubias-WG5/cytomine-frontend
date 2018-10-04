<template>
    <div :ref="chart.uuid"></div>
</template>

<script>
    import Plotly from 'plotly.js/lib/core';

    export default {
        name: "PlotlyLineChart",
        props: [
            'chart'
        ],
        watch: {
            chart: {
                handler: function () {
                    Plotly.react(
                        this.$refs[this.chart.uuid],
                        this.chart.traces,
                        this.chart.layout,
                        {responsive: true}
                    );
                },
                deep: true
            }
        },
        mounted() {
            Plotly.plot(this.$refs[this.chart.uuid], this.chart.traces, this.chart.layout);
        }
    }
</script>

<style scoped>

</style>
