<template>
    <div class="row">
        <div class="col-md-12">
            <div class="panel panel-default">
                <div class="panel-heading">
                    <h3 class="panel-title"><i class="fas fa-chart-line"></i> Results ({{filteredJobs.length}} job<span v-if="filteredJobs.length > 1">s</span> shown on {{images.length}} image<span v-if="images.length > 1">s</span>)</h3>
                </div>
                <div class="panel-body">

                    <tabs>
                        <tab title="Aggregated results">
                            <benchmark-table :aggregates="aggregates" :parameters="parameters"
                                             :header-column="headerColumn" :job-columns="filteredJobColumns"
                                             :softwares="softwares" :sort="sort" @changeSort="changeSort"
                                             :show-parameters="showParameters" @removeJob="removeJob"></benchmark-table>
                        </tab>
                        <tab title="Detailed results by image">
                            <div class="benchmark-per-image-tab">
                                <benchmark-table-per-image v-for="image in images" :image="image" :parameters="parameters"
                                                           :header-column="headerColumn" :job-columns="filteredJobColumns"
                                                           :softwares="softwares" :sort="sort" @changeSort="changeSort"
                                                           :show-parameters="showParameters" @removeJob="removeJob"></benchmark-table-per-image>
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
    import orderby from 'lodash.orderby'

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
            'allAggregates',
            'showParameters',
            'clickGenerate'
        ],
        data() {
            return {
                sort: {
                    field: '',
                    order: ''
                },
                hiddenJobs: []
            }
        },
        computed: {
            headerColumn() {
                let params = this.parameters.map(parameter => {
                    return {
                        id: parameter.name,
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
                return this.filteredJobs.map(job => {
                    let j = Vue.util.extend({}, job);

                    this.metricResults.filter(r => r.job == job.id).forEach(r => {
                        j[`${r.image}-${r.metric}`] = r.value;
                        j[`${r.image}-${r.metric}-object`] = r
                    });

                    job.jobParameters.forEach(p => {
                        j[p.name] = p.value;
                        j[`${p.name}-object`] = p
                    });

                    this.aggregatedMetricResults.filter(r => r.job == job.id).forEach(r => {
                        this.allAggregates.forEach(a => {
                            j[`aggregate-${r.metric}-${a.code}`] = r[a.code]
                        });
                    });
                    return j;
                })
            },
            filteredJobColumns() {
                return orderby(this.jobColumns, [this.sort.field], [this.sort.order])
            },
            filteredJobs() {
                return this.jobs.filter(job => !this.hiddenJobs.includes(job.id))
            }
        },
        methods: {
            changeSort(payload) {
                this.sort.field = payload.field;
                this.sort.order = payload.order;
            },
            removeJob(id) {
                this.hiddenJobs.push(id)
            }
        },
        watch: {
            clickGenerate() {
                this.hiddenJobs.splice(0, this.hiddenJobs.length);
            }
        }
    }
</script>

<style scoped>
    .benchmark-per-image-tab {
        padding-top: 1rem;
    }
</style>
