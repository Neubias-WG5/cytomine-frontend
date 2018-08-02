<script>
    import { Pie, mixins } from 'vue-chartjs'
    const { reactiveProp } = mixins;
    export default {
        extends: Pie,
        mixins: [reactiveProp],
        name: "SoftwareStatisticsChart",
        props: ['options'],
        mounted() {
            this.options.tooltips = {
                callbacks: {
                    label: function(tooltipItem, data) {
                        let dataset = data.datasets[tooltipItem.datasetIndex];
                        let total = dataset.data.reduce(function(previousValue, currentValue, currentIndex, array) {
                            return previousValue + currentValue;
                        });

                        let currentValue = dataset.data[tooltipItem.index];
                        let percentage = Math.floor(((currentValue/total) * 100)+0.5);
                        return `${currentValue} (${percentage}%)`;
                    }
                }
            };

            this.renderChart(this.chartData, this.options)
        }
    }
</script>

