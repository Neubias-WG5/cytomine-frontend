<template>
    <div class="row">
        <div class="col-md-12">
            <div class="panel panel-default">
                <div class="panel-heading">
                    <h3 class="panel-title"><i class="fas fa-chart-line"></i> Results</h3>
                </div>
                <div class="panel-body">

                    <tabs>
                        <tab title="Aggregated results">
                            <benchmark-table :aggregates="aggregates" :parameters="parameters"
                                             :header-column="headerColumn" :job-columns="jobColumns"
                                             :softwares="softwares" ></benchmark-table>
                        </tab>
                        <tab title="Detailed results by image">
                            <div class="benchmark-per-image-tab">
                                <benchmark-table-per-image v-for="image in images" :image="image" :parameters="parameters"
                                                           :header-column="headerColumn" :job-columns="jobColumns"
                                                           :softwares="softwares"></benchmark-table-per-image>
                            </div>


                        </tab>
                    </tabs>



                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Vue from 'vue'
    import {Tabs, Tab} from 'uiv'
    import BenchmarkTablePerImage from "./BenchmarkTablePerImage";
    import BenchmarkTable from "./BenchmarkTable";
    export default {
        name: "BenchmarkResults",
        components: {
            BenchmarkTable,
            BenchmarkTablePerImage,
            Tabs,
            Tab
        },
        props: [
            'images',
            'metrics',
            'metricResults',
            'aggregatedMetricResults',
            'jobs',
            'parameters',
            'softwares',
            'aggregates',
            'allAggregates'
        ],
        data() {
            return {
                filters: []
            }
        },
        computed: {
            headerColumn() {
                let params = this.parameters.map(parameter => {
                    return {
                        id: parameter.id,
                        type: 'parameter',
                        data: parameter
                    }
                });

                let metrics = this.metrics.map(metric => {
                    return {
                        id: metric.id,
                        type: 'metric',
                        data: metric
                    }
                });

                return params.concat(metrics)
            },
            jobColumns() {
                return this.jobs.map(job => {
                    let j = Vue.util.extend({}, job);

                    this.metricResults.filter(r => r.job == job.id).forEach(r => {
                        j[`${r.image}-${r.metric}`] = r
                    });

                    job.jobParameters.forEach(p => {
                        j[p.softwareParameter] = p
                    });

                    this.aggregatedMetricResults.filter(r => r.job == job.id).forEach(r => {
                        this.allAggregates.forEach(a => {
                            j[`aggregate-${r.metric}-${a.code}`] = r[a.code]
                        });
                    });
                    return j;
                })
            }
        }
    }
</script>

<style scoped>
    .benchmark-per-image-tab {
        padding-top: 1rem;
    }
</style>
