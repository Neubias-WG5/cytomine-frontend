<template>
    <div class="container-100" style="padding-top: 10px;">
        <div v-if="!project.discipline">
            <div style="margin: auto;margin-top:100px;max-width:400px;width:auto;">
                <div class="alert alert-warning">
                    <h4 class="alert-heading">No benchmark !</h4>
                    <br/>
                    <i class="icon icon-warning-sign"/> There is no metric because there is no discipline for this project.
                </div>
            </div>
        </div>
        <div v-else class="row">
            <div class="col-md-7">
                <div class="panel panel-default">
                    <div class="panel-heading">
                        <h3 class="panel-title"><i class="fas fa-filter"></i> Filters</h3>
                    </div>
                    <div class="panel-body">
                        <div class="form-horizontal">
                            <div class="form-group">
                                <label class="col-sm-2 control-label">Images</label>
                                <div class="col-sm-10">
                                    <multiselect v-model="selectedImages" :options="imageOptions"
                                                 :multiple="true" :close-on-select="false" :clear-on-select="false"
                                                 :preserve-search="true" placeholder="Pick some" :option-height="69"
                                                 track-by="instanceFilename"  group-label="group"
                                                 group-values="items" :group-select="true">
                                        <template slot="selection" slot-scope="{ values, search, isOpen }">
                                            <span class="multiselect__single" v-if="values.length && !isOpen">
                                                {{values.length}}/{{images.length}} image(s) selected
                                            </span>
                                        </template>
                                        <template slot="option" slot-scope="props">
                                            <span v-if="props.option != undefined && props.option.$isLabel">
                                                {{props.option.$groupLabel}}
                                            </span>
                                            <div v-else>
                                                <img class="option-image" :src="props.option.thumb">
                                                <div class="option-desc">
                                                    <span class="option-title">{{ props.option.instanceFilename }}</span>
                                                </div>
                                            </div>
                                        </template>
                                    </multiselect>
                                    <p class="text-warning" v-if="selectedImages.length == 0">You need to choose at least one image.</p>
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="col-sm-offset-2 col-sm-10">
                                    <div class="radio">
                                        <label for="type-filter-software">
                                            <input type="radio" name="select-type" class="input-radio" id="type-filter-software" value="software" v-model="selectType">
                                            <template v-if="selectType == 'software'">
                                                All jobs from specified software ({{selectedSoftwares.length}}/{{softwareWithSuccessfulJobs.length}}) in the list
                                            </template>
                                            <template v-else>All jobs of specified software in the list </template>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group" v-if="selectType == 'software'">
                                <label class="col-sm-2 control-label">Software</label>
                                <div class="col-sm-10">
                                    <multiselect v-model="selectedSoftwares" :options="softwareOptions"
                                                 :multiple="true" :close-on-select="false" :clear-on-select="false"
                                                 :preserve-search="true" placeholder="Pick some" :option-height="69"
                                                 track-by="fullName"  group-label="group"
                                                 group-values="items" :group-select="true">
                                        <template slot="selection" slot-scope="{ values, search, isOpen }">
                                            <span class="multiselect__single" v-if="values.length && !isOpen">
                                                {{values.length}}/{{softwareWithSuccessfulJobs.length}} software selected
                                            </span>
                                        </template>
                                        <template slot="option" slot-scope="props">
                                            <span v-if="props.option != undefined && props.option.$isLabel">
                                                {{props.option.$groupLabel}}
                                            </span>
                                            <div v-else>
                                                {{props.option.fullName}} <software-deprecated-item :value="props.option.deprecated" :row="props.option"></software-deprecated-item>
                                            </div>
                                        </template>
                                    </multiselect>
                                    <p class="text-warning" v-if="selectedSoftwares.length == 0">You need to choose at least one software.</p>
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="col-sm-offset-2 col-sm-10">
                                    <div class="radio">
                                        <label for="type-filter-job">
                                            <input type="radio" name="select-type" class="input-radio" id="type-filter-job" value="job" v-model="selectType">
                                            <template v-if="selectType == 'job'">All specified jobs ({{selectedJobs.length}}/{{successfulJobs.length}}) in the list</template>
                                            <template v-else>All specified jobs in the list</template>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group" v-if="selectType == 'job'">
                                <label class="col-sm-2 control-label">Jobs</label>
                                <div class="col-sm-10">
                                    <multiselect v-model="selectedJobs" :options="jobOptions"
                                                 :multiple="true" :close-on-select="false" :clear-on-select="false"
                                                 :preserve-search="true" placeholder="Pick some" :option-height="69"
                                                 track-by="id"  group-label="software"
                                                 group-values="jobs" :group-select="true">
                                        <template slot="selection" slot-scope="{ values, search, isOpen }">
                                            <span class="multiselect__single" v-if="values.length && !isOpen">
                                                {{values.length}}/{{successfulJobs.length}} jobs selected
                                            </span>
                                        </template>
                                        <template slot="option" slot-scope="props">
                                            <span v-if="props.option != undefined && props.option.$isLabel">
                                                {{props.option.$groupLabel.fullName}}
                                            </span>
                                            <div v-else>
                                                <i class="fas fa-star" v-if="props.option.favorite"></i> Job #{{props.option.number}} launched by {{props.option.username}} on <date-item :value="props.option.created"></date-item>
                                            </div>
                                        </template>
                                    </multiselect>
                                    <p class="text-warning" v-if="selectedJobs.length == 0">You need to choose at least one job.</p>
                                </div>
                            </div>
                            <div class="">
                                <div class="text-center">
                                    <button class="btn btn-primary" :disabled="!canGenerate" @click="generate()"><i class="fas fa-rocket"></i> Generate report !</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <div class="col-md-5">
                <div class="panel panel-default">
                    <div class="panel-heading">
                        <h3 class="panel-title"><i class="fas fa-cogs"></i> Options</h3>
                    </div>
                    <div class="panel-body">
                        <div class="form-horizontal">
                            <div class="form-group">
                                <label class="col-sm-2 control-label">Metrics</label>
                                <div class="col-sm-10 metrics-checkboxes">
                                    <div class="checkbox" v-for="metric in metrics">
                                        <label>
                                            <input type="checkbox" v-model="metric.selected"> {{metric.name}} ({{metric.shortName}})
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="col-sm-3 control-label">Aggregate functions</label>
                                <div class="col-sm-9 aggregates-checkboxes">
                                    <div class="checkbox" v-for="aggregate in aggregates">
                                        <label>
                                            <input type="checkbox" v-model="aggregate.selected"> {{aggregate.name}}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="col-sm-3 control-label">Parameters</label>
                                <div class="col-sm-9">
                                    <label class="radio-inline">
                                        <input type="radio" name="show-parameters" :value="true" v-model="showParameters"> Show
                                    </label>
                                    <label class="radio-inline">
                                        <input type="radio" name="show-parameters" :value="false" v-model="showParameters"> Hide
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <benchmark-results v-if="showResults" :images="displayedImages" :parameters="displayedSoftwareParameters" :metrics="selectedMetrics"
                           :jobs="displayedJobs" :metric-results="metricResults" :softwares="displayedSoftwares" :show-parameters="showParameters"
                           :aggregated-metric-results="aggregatedMetricResults" :aggregates="selectedAggregates" :all-aggregates="aggregates" :click-generate="clickGenerate"></benchmark-results>

    </div>
</template>

<script>
    import Multiselect from 'vue-multiselect'
    import 'vue-multiselect/dist/vue-multiselect.min.css'
    import uniqby from 'lodash.uniqby'
    import DateItem from "../Datatable/DateItem";
    import BenchmarkTablePerImage from "./BenchmarkTablePerImage";
    import BenchmarkResults from "./BenchmarkResults";
    import SoftwareDeprecatedItem from "../Software/SoftwareDeprecatedItem";

    export default {
        name: "Benchmark",
        components: {
            SoftwareDeprecatedItem,
            BenchmarkResults,
            BenchmarkTablePerImage,
            DateItem,
            Multiselect
        },
        data() {
            return {
                aggregates: [
                    {name: 'Minimum', code: 'minimum', selected: true},
                    {name: 'Maximum', code: 'maximum', selected:true},
                    {name: 'Mean', code: 'average', selected: true},
                    {name: 'Standard deviation', code: 'stddev', selected: true},
                    {name: 'Median', code: 'median', selected: true},
                    ],
                project: {},
                metrics: [],
                softwares: [], // All software in project
                selectedSoftwares: [], // Selected software in the dropdown list
                displayedSoftwares: [], // Displayed software in the report
                jobs: [], // All jobs in project
                selectedJobs: [], // Selected jobs in the dropdown list
                displayedJobs: [], // Displayed jobs in the report
                imageGroups: [], // All image groups in project
                imageInstances: [], // All image instances in project
                selectedImages: [], // Selected images (instance or group) in the dropdown list
                displayedImages: [], // Displayed images in the report
                selectType: 'job',
                metricResults: [],
                aggregatedMetricResults: [],
                showResults: false,
                showParameters: true,
                clickGenerate: 0,
            }
        },
        computed: {
            projectId() {
                // DEPENDS ON [BACKBONE]
                return window.app.status.currentProject;
            },
            imageGroupsWithFilename() {
                return this.imageGroups.map(group => {
                    group.instanceFilename = group.name;
                    return group;
                })
            },
            successfulJobs() {
                return this.jobs.filter(job => job.status == 3)
            },
            softwareWithSuccessfulJobs() {
                let ids = uniqby(this.jobs.map(job => job.software));
                return this.softwares.filter(software => ids.includes(software.id))
            },
            images() {
                return (this.imageGroups.length > 0) ? this.imageGroupsWithFilename : this.imageInstances
            },
            imageOptions() {
                return [{
                    group: 'All images',
                    items: (this.imageGroups.length > 0) ? this.imageGroupsWithFilename : this.imageInstances
                }]
            },
            softwareOptions() {
                return [{
                    group: 'All software',
                    items: this.softwareWithSuccessfulJobs
                }]
            },
            jobOptions() {
                let options = [];
                this.softwareWithSuccessfulJobs.forEach(software => {
                    options.push({
                        software: software,
                        jobs: this.successfulJobs.filter(job => job.software == software.id)
                    })
                });
                return options;
            },
            canGenerate() {
                return this.selectedImages.length > 0 && (
                    (this.selectType == 'software' && this.selectedSoftwares.length > 0) ||
                    (this.selectType == 'job' && this.selectedJobs.length > 0)
                )
            },
            selectedMetrics() {
                return this.metrics.filter(metric => metric.selected)
            },
            selectedAggregates() {
                return this.aggregates.filter(aggregate => aggregate.selected)
            },
            displayedSoftwareParameters() {
                let params = this.displayedSoftwares.map(software => software.parameters).reduce((a, b) => a.concat(b), []);
                return uniqby(params, 'name');
            },
            favoriteJobs() {
                return this.jobs.filter(item => item.favorite)
            }
        },
        methods: {
            loadData() {
                api.get(`api/project/${this.projectId}.json`).then(response => {
                    this.project = response.data;
                    if (!this.project.discipline)
                        return;

                    api.get(`api/discipline/${this.project.discipline}/metric.json`).then(response => {
                        this.metrics = response.data.collection.map(metric => {
                            metric.selected = true;
                            return metric;
                        });
                    });

                    api.get(`api/project/${this.project.id}/imagegroup.json?withoutLabel=true`).then(response => {
                        this.imageGroups = response.data.collection;
                        this.selectedImages = this.imageGroupsWithFilename;

                        if (this.imageGroups.length == 0) {
                            api.get(`api/project/${this.project.id}/imageinstance.json?withoutLabel=true`).then(response => {
                                this.imageInstances = response.data.collection;
                                this.selectedImages = this.imageInstances;
                            })
                        }
                    });

                    api.get(`api/project/${this.project.id}/software.json`).then(response => {
                        this.softwares = response.data.collection;
                    });

                    api.get(`api/job.json?project=${this.project.id}`).then(response => {
                        this.jobs = response.data.collection;
                        this.selectedJobs = this.favoriteJobs;
                    })
                })
            },
            generate() {
                let imageIds = (this.selectedImages.length != this.images.length) ? `&images=${this.selectedImages.map(image => image.id).join(",")}` : "";
                let jobIds = (this.selectedJobs.length != this.successfulJobs.length && this.selectType == 'job') ? `&jobs=${this.selectedJobs.map(job => job.id).join(",")}` : "";
                let softwareIds = (this.selectedSoftwares.length != this.softwareWithSuccessfulJobs.length && this.selectType == 'software') ? `&softwares=${this.selectedSoftwares.map(software => software.id).join(",")}` : "";

                let resource = (this.imageGroups.length > 0) ? 'imagegroupmetricresult' : 'imageinstancemetricresult';
                api.get(`api/${resource}.json?project=${this.project.id}${imageIds}${jobIds}${softwareIds}`).then(response => {
                    this.metricResults = response.data.collection;
                    this.showResults = true;
                    this.displayedImages = this.selectedImages;
                    if (this.selectType == 'software') {
                        let ids = this.selectedSoftwares.map(software => software.id);
                        this.displayedJobs = this.successfulJobs.filter(job => ids.includes(job.software));
                        this.displayedSoftwares = this.selectedSoftwares;
                    }
                    else {
                        let ids = uniqby(this.selectedJobs.map(job => job.software));
                        this.displayedSoftwares = this.softwareWithSuccessfulJobs.filter(software => ids.includes(software.id));
                        this.displayedJobs = this.selectedJobs;
                    }
                });

                api.get(`api/${resource}.json?aggregate=true&project=${this.project.id}${imageIds}${jobIds}${softwareIds}`).then(response => {
                    this.aggregatedMetricResults = response.data.collection;
                });

                this.clickGenerate++;
            }
        },
        created() {
            this.loadData()
        }
    }
</script>

<style scoped>
    .metrics-checkboxes {
        -webkit-column-count: 2;
        -moz-column-count: 2;
        column-count: 2;
    }

    .aggregates-checkboxes {
        -webkit-column-count: 3;
        -moz-column-count: 3;
        column-count: 3;
    }

    .multiselect {
        line-height: initial;
    }

    .option-image {
        display: inline-block;
        vertical-align: middle;
        max-height: 45px;
        max-width: 128px;
        margin-right: 10px;
    }

    .option-desc {
        display: inline-block;
        vertical-align: middle;
    }
</style>
