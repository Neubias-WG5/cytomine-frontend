<template>
    <div style="margin-top: 10px;">
        <div v-if="!project.discipline">
            <div style="margin: auto;max-width:400px;width:auto;">
                <div class="alert alert-warning">
                    <h4 class="alert-heading">No benchmark !</h4>
                    <br/>
                    <i class="icon icon-warning-sign"/> There is no metric because there is no discipline for this project.
                </div>
            </div>
        </div>
        <div v-else-if="job.status != 3">
            <div style="margin: auto;max-width:400px;width:auto;">
                <div class="alert alert-warning">
                    <h4 class="alert-heading">No result</h4>
                    <br/>
                    <i class="icon icon-warning-sign"/> There is no result for this job
                    <template v-if="job.status < 3">yet. <br> <button class="btn btn-default">Refresh</button></template>

                </div>
            </div>
        </div>
        <div v-else class="table-responsive">
            <table class="table table-condensed table-hover table-bordered table-striped">
                <thead>
                <tr>
                    <th>
                        <sort-button :sort="sort" field="instanceFilename" @changeSort="changeSort"></sort-button>
                        Images
                    </th>
                    <th v-for="metric in metrics">
                        <sort-button :sort="sort" :field="metric.id" @changeSort="changeSort"></sort-button>
                        <abbr :title="metric.name">{{metric.shortName}}</abbr>
                    </th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="image in sortedImagesWithResults">
                    <th>{{image.instanceFilename}}</th>
                    <td v-for="metric in metrics">
                        <span v-if="image[metric.id] != undefined">
                                {{image[metric.id]}}
                            </span>
                        <span class="no-metric-cell text-muted" v-else><small>N/A</small></span>
                    </td>
                </tr>
                <tr v-for="(aggregate, index) in aggregates">
                    <th :class="[{'border-top': index ==0}]">{{aggregate.name}}</th>
                    <td :class="[{'border-top': index ==0}]" v-for="metric in metrics">
                        <span v-if="aggregateMetricById(metric.id) != undefined && aggregateMetricById(metric.id)[aggregate.code] != undefined">
                                {{aggregateMetricById(metric.id)[aggregate.code].toFixed(2)}}
                            </span>
                        <span class="no-metric-cell text-muted" v-else><small>N/A</small></span>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
    import Vue from 'vue'
    import SortButton from "./SortButton";
    import orderby from 'lodash.orderby'

    export default {
        name: "BenchmarkTablePerJob",
        components: {SortButton},
        data() {
            return {
                aggregates: [
                    {name: 'Minimum', code: 'minimum', selected: true},
                    {name: 'Maximum', code: 'maximum', selected:true},
                    {name: 'Mean', code: 'average', selected: true},
                    {name: 'Standard deviation', code: 'stddev', selected: true},
                    {name: 'Median', code: 'median', selected: true},
                ],
                sort: {
                    field: '',
                    order: ''
                },
                metrics: [],
                imageGroups: [], // All image groups in project
                imageInstances: [], // All image instances in project
                metricResults: [],
                aggregatedMetricResults: [],
            }
        },
        computed: {
            project() {
                // DEPENDS ON [BACKBONE]
                return window.app.status.currentProjectModel.attributes;
            },
            job() {
                return window.app.status.currentJobModel.attributes;
            },
            imageGroupsWithFilename() {
                return this.imageGroups.map(group => {
                    group.instanceFilename = group.name;
                    return group;
                })
            },
            images() {
                return (this.imageGroups.length > 0) ? this.imageGroupsWithFilename : this.imageInstances
            },
            imagesWithResults() {
                return this.images.map(image => {
                    let i = Vue.util.extend({}, image);

                    this.metricResults.filter(r => r.image == image.id).forEach(r => {
                        i[r.metric] = r.value;
                    });
                    return i;
                });
            },
            sortedImagesWithResults() {
                return orderby(this.imagesWithResults, [this.sort.field], [this.sort.order])
            }
        },
        watch: {
            job: {
                handler(newValue) {
                    if (newValue.status == 3)
                        this.loadData()
                },
                deep: true
            }
        },
        methods: {
            loadData() {
                console.log("load");
                api.get(`api/discipline/${this.project.discipline}/metric.json`).then(response => {
                    this.metrics = response.data.collection.map(metric => {
                        metric.selected = true;
                        return metric;
                    });
                });

                api.get(`api/project/${this.project.id}/imagegroup.json`).then(response => {
                    this.imageGroups = response.data.collection;

                    if (this.imageGroups.length == 0) {
                        api.get(`api/project/${this.project.id}/imageinstance.json?withoutLabel=true`).then(response => {
                            this.imageInstances = response.data.collection;
                        })
                    }

                    let resource = (this.imageGroups.length > 0) ? 'imagegroupmetricresult' : 'imageinstancemetricresult';
                    api.get(`api/job/${this.job.id}/${resource}.json`).then(response => {
                        this.metricResults = response.data.collection;
                    });

                    api.get(`api/job/${this.job.id}/${resource}.json?aggregate=true`).then(response => {
                        this.aggregatedMetricResults = response.data.collection;
                    })
                });
            },
            aggregateMetricById(metricId) {
                return this.aggregatedMetricResults.find(aggregate => aggregate.metric == metricId);
            },
            changeSort(payload) {
                this.sort.field = payload.field;
                this.sort.order = payload.order;
            },
        },
        created() {
            this.loadData()
        }
    }
</script>

<style scoped>
    .border-top {
        border-top-width: 4px;
    }
</style>
