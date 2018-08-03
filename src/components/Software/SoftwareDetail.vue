<template>
    <!--<tab :title="fullName">-->
    <div>
        <h1>{{ software.fullName }}</h1>
        <blockquote v-if="description">
            <p>{{description}}</p>
        </blockquote>
        <div class="container-fluid">
            <div class="row">
                <div class="col-md-8">
                    <div class="panel panel-default">
                        <div class="panel-heading clearfix">
                            <h3 class="panel-title pull-left">General information</h3>
                            <div class="btn-group pull-right">
                                <button class="btn btn-default btn-xs" @click="openEditModal=true"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>
                                <delete-object-button :object="software" domain="software" domain-pretty-print="software" @delete-software="deleteSoftware"></delete-object-button>
                            </div>
                        </div>
                        <div class="panel-body">
                            <dl class="dl-horizontal">
                                <dt>Full name</dt>
                                <dd>{{software.fullName}}</dd>

                                <dt>Name</dt>
                                <dd>{{software.name}}</dd>

                                <dt>Version</dt>
                                <dd>{{software.softwareVersion}}</dd>

                                <dt>Version status</dt>
                                <dd><software-deprecated-item :value="software.deprecated" :row="software"></software-deprecated-item></dd>

                                <dt>Executable</dt>
                                <dd><boolean-item :value="software.executable"></boolean-item></dd>

                                <dt>Identifier</dt>
                                <dd>{{software.id}}</dd>

                                <dt>Created on</dt>
                                <dd><date-item :value="software.created"></date-item></dd>

                                <dt>Updated on</dt>
                                <dd><date-item :value="software.updated"></date-item></dd>

                                <dt>Software source</dt>
                                <dd><software-repository-name :softwareRepository="findSoftwareRepository(software.softwareUserRepository)"></software-repository-name></dd>



                            </dl>
                            <div class="pull-right">
                                <software-source-buttons :software="software" :softwareRepository="findSoftwareRepository(software.softwareUserRepository)"></software-source-buttons>
                                <button class="btn" @click="showMoreInfo=!showMoreInfo">
                                    <template v-if="showMoreInfo">
                                        <i class="fa fa-eye-slash" aria-hidden="true"></i> Hide info for developers
                                    </template>
                                    <template v-else>
                                        <i class="fa fa-eye" aria-hidden="true"></i> Show info for developers
                                    </template>

                                </button>
                            </div>

                            <div style="clear:both;"></div>
                            <collapse v-model="showMoreInfo">
                                <dl class="dl-horizontal">
                                    <dt>Result name</dt>
                                    <dd>{{software.resultName}}</dd>

                                    <dt>Execute command</dt>
                                    <dd><pre>{{software.executeCommand}}</pre></dd>

                                    <dt>Pulling command</dt>
                                    <dd><pre>{{software.pullingCommand}}</pre></dd>
                                </dl>
                            </collapse>
                        </div>
                    </div>
                    <software-edit-modal :software="software" :open="openEditModal" @close="setOpenEditModal" @update-software="updateSoftware"></software-edit-modal>

                </div>
                <div class="col-md-4">
                    <div class="panel panel-default">
                        <div class="panel-heading clearfix">
                            <h3 class="panel-title pull-left">Statistics</h3>
                            <div class="pull-right"><button class="btn btn-default btn-xs" @click="openStatsModal=true"><i class="fa fa-info-circle" aria-hidden="true"></i></button></div>
                        </div>
                        <div class="panel-body">
                            <software-statistics-chart :chartData="statisticsData" :options="statisticsOptions"></software-statistics-chart>
                            <p class="text-center">Status distribution for {{software.numberOfJob}} jobs</p>
                        </div>
                    </div>
                </div>
                <modal v-model="openStatsModal" title="Job status reference" :footer="false">
                    <table class="table table-striped table-bordered">
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Explanation</th>
                            </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td><span class="label label-default">Not launched</span></td>
                            <td>The job has been asked for execution from Cytomine-Core but Cytomine-software-router doesn't have handled the request yet.</td>
                        </tr>
                        <tr>
                            <td><span class="label label-warning">Waiting</span></td>
                            <td>The job is being transfered to its processing server.</td>
                        </tr>
                        <tr>
                            <td><span class="label label-info">In queue</span></td>
                            <td>The job is in the queue of its processing server.</td>
                        </tr>
                        <tr>
                            <td><span class="label label-primary">Running</span></td>
                            <td>The job is running. It is the responsability of software maintainer to set status to running in the running script.</td>
                        </tr>
                        <tr>
                            <td><span class="label label-success">Successful</span></td>
                            <td>The job has been finished successfully.</td>
                        </tr>
                        <tr>
                            <td><span class="label label-danger">Failed</span></td>
                            <td>An error occurred during job execution (while it was in queue or running).</td>
                        </tr>
                        <tr>
                            <td><span class="label label-default">Indeterminate</span></td>
                            <td>The job is in an indeterminate state, probably due to a server reboot.</td>
                        </tr>
                        <tr>
                            <td><span class="label label-killed">Killed</span></td>
                            <td>The job has been killed (by a human). Killing a job is only possible if it is in queue or running.</td>
                        </tr>
                        </tbody>
                    </table>
                </modal>
                <div class="col-md-8">
                    <div class="panel panel-default">
                        <div class="panel-heading">
                            <h3 class="panel-title">Parameters</h3>
                        </div>
                        <div class="panel-body">
                            <div class="panel-group">
                                <div class="panel panel-default" v-for="(parameter, index) in software.parameters" :key="parameter.id">
                                    <div class="panel-heading clearfix" role="button" @click="toggleAccordion(index)">
                                        <h4 class="panel-title pull-left">{{parameter.humanName}} (<code>{{parameter.name}}</code>)</h4>
                                        <div class="btn-group pull-right">
                                            <button class="btn btn-default btn-xs" @click="showEditParameterModal(index)"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>
                                            <delete-object-button :object="parameter" domain="softwareparameter" domain-pretty-print="software parameter" @delete-softwareparameter="deleteSoftwareParameter"></delete-object-button>
                                        </div>
                                    </div>
                                    <collapse v-model="showParameters[index]">
                                        <div class="panel-body">
                                            <blockquote v-if="parameter.description">
                                                <p>{{parameter.description}}</p>
                                            </blockquote>
                                            <dl class="dl-horizontal">
                                                <dt>Type</dt>
                                                <dd>{{parameter.type}}</dd>

                                                <dt>Default value</dt>
                                                <dd>{{parameter.defaultParamValue}}</dd>

                                                <dt>Required</dt>
                                                <dd v-if="parameter.required">Yes</dd>
                                                <dd v-else>No</dd>

                                                <dt>Constraints</dt>
                                                <dd>
                                                    <software-parameter-constraints :parameterConstraints="parameter.constraints"
                                                                                    :constraints="parameterConstraints"></software-parameter-constraints>
                                                </dd>
                                            </dl>

                                            <button class="btn pull-right" @click="toogleMoreInfo(index)">
                                                <template v-if="showParametersMoreInfo[index]">
                                                    <i class="fa fa-eye-slash" aria-hidden="true"></i> Hide info for developers
                                                </template>
                                                <template v-else>
                                                    <i class="fa fa-eye" aria-hidden="true"></i> Show info for developers
                                                </template>

                                            </button>
                                            <collapse v-model="showParametersMoreInfo[index]">
                                                <dl class="dl-horizontal">
                                                    <dt>Identifier</dt>
                                                    <dd>{{parameter.id}}</dd>

                                                    <dt>Created on</dt>
                                                    <dd><date-item :value="parameter.created"></date-item></dd>

                                                    <dt>Updated on</dt>
                                                    <dd><date-item :value="parameter.updated"></date-item></dd>

                                                    <dt>Value key</dt>
                                                    <dd><code>{{parameter.valueKey}}</code></dd>

                                                    <dt>Command line flag</dt>
                                                    <dd><code>{{parameter.commandLineFlag}}</code></dd>
                                                </dl>
                                            </collapse>

                                        </div>
                                    </collapse>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
                <software-parameter-edit-modal :sp="openParameter" :open="openEditParameterModal" @close="setOpenEditParameterModal" @update-softwareparameter="updateSoftwareParameter"></software-parameter-edit-modal>

                <div class="col-md-4">
                    <div class="panel panel-default">
                        <div class="panel-heading">
                            <h3 class="panel-title">Projects using {{software.fullName}}</h3>
                        </div>
                        <ul class="list-group">
                            <li class="list-group-item" v-for="(project, index) in projects" :key="project.id">
                                <div class="btn-group pull-right">
                                    <button class="btn btn-default btn-xs" @click="openInfoProjectModal(index)"><i class="fa fa-info-circle" aria-hidden="true"></i> Info</button>
                                    <a class="btn btn-default btn-xs" :href="'#tabs-dashboard-'+project.id"><i class="fa fa-eye" aria-hidden="true"></i> Explore</a>
                                </div>
                                <a :href="'#tabs-algos-'+project.id+'-'+software.id+'-'">{{project.name}}</a>

                            </li>
                        </ul>
                    </div>
                </div>
                <project-info-modal :project="openInfoProject" :open="openInfoModal" @close="setOpenInfoModal"></project-info-modal>
            </div>
        </div>
    </div>

</template>

<script>
    import {Tab, Collapse} from 'uiv'
    import DateItem from "../Datatable/DateItem";
    import SoftwareStatisticsChart from "./SoftwareStatisticsChart";
    import BooleanItem from "../Datatable/BooleanItem";
    import SoftwareDeprecatedItem from "./SoftwareDeprecatedItem";
    import SoftwareRepositoryName from "./SoftwareUserRepository/SoftwareRepositoryName";
    import SoftwareSourceButtons from "./SoftwareUserRepository/SoftwareSourceButtons";
    import Modal from "uiv/src/components/modal/Modal";
    import SoftwareParameterConstraints from "./SoftwareParameterConstraints";
    import ProjectInfoModal from "../Project/ProjectInfoModal";
    import SoftwareEditModal from "./SoftwareEditModal";
    import SoftwareParameterEditModal from "./SoftwareParameterEditModal";
    import DeleteObjectButton from "../Datatable/DeleteObjectButton";

    export default {
        name: "SoftwareDetail",
        components: {
            DeleteObjectButton,
            SoftwareEditModal,
            SoftwareParameterEditModal,
            ProjectInfoModal,
            SoftwareParameterConstraints,
            Modal,
            SoftwareSourceButtons,
            SoftwareRepositoryName,
            SoftwareDeprecatedItem,
            BooleanItem,
            SoftwareStatisticsChart,
            DateItem,
            Tab,
            Collapse
        },
        props: [
            'software',
            'softwareUserRepositories',
            'parameterConstraints'
        ],
        data() {
            return {
                description: "",
                statisticsOptions: {},
                projects: [],
                showMoreInfo: false,
                showParameters: [],
                showParametersMoreInfo: [],
                openStatsModal: false,
                openInfoModal: false,
                openInfoProject: {},
                openEditModal: false,
                openEditParameterModal: false,
                openParameter: {},
            }
        },
        computed: {
            statisticsData() {
                return {
                    labels: ['Not launched', 'Waiting', 'In queue', 'Running', 'Successful', 'Failed', 'Indeterminate', 'Killed'],
                    datasets: [
                        {
                            backgroundColor: ["#777777", "#f0ad4e", "#5bc0de", "#337AB7", "#5cb85c", "#d9534f", "#777777", "#000000"],
                            data: [this.software.numberOfNotLaunch, this.software.numberOfWait, this.software.numberOfInQueue,
                            this.software.numberOfRunning, this.software.numberOfSuccess, this.software.numberOfFailed,
                            this.software.numberOfIndeterminate, this.software.numberOfKilled]
                        }
                    ]
                }
            },
            parameters() {
                return this.software.parameters;
            }
        },
        methods: {
            toggleAccordion (index) {
                if (this.showParameters[index]) {
                    this.$set(this.showParameters, index, false)
                } else {
                    this.showParameters = this.showParameters.map((v, i) => i === index)
                }
            },
            toogleMoreInfo(index) {
                this.$set(this.showParametersMoreInfo, index, !this.showParametersMoreInfo[index])
            },
            findSoftwareRepository(id) {
                return this.softwareUserRepositories.find(s => {
                    return s.id === id;
                });
            },
            openInfoProjectModal(index) {
                this.openInfoProject = this.projects[index];
                this.openInfoModal = true;
            },
            showEditParameterModal(index) {
                this.openEditParameterModal = true;
                this.openParameter = this.software.parameters[index];
            },
            setOpenInfoModal(value) {
                this.openInfoModal = value;
            },
            setOpenEditModal(value) {
                this.openEditModal = value;
            },
            setOpenEditParameterModal(value) {
                this.openEditParameterModal = value;
            },
            deleteSoftware(payload) {
                this.$emit('delete-software', payload);
            },
            updateSoftware(payload) {
                this.$emit('update-software', payload);
            },
            deleteSoftwareParameter(payload) {
                let index = this.software.parameters.findIndex(s => {
                    return s.id === payload.id;
                });

                if (index != -1) {
                    this.software.parameters.splice(index, 1);
                }
            },
            updateSoftwareParameter(payload) {
                let index = this.software.parameters.findIndex(s => {
                    return s.id === payload.id;
                });

                if (index != -1) {
                    this.$set(this.software.parameters, index, payload);
                    this.$emit('update-software', this.software);
                }
            }
        },
        created() {
            api.get(`api/domain/be.cytomine.processing.Software/${this.software.id}/description.json`).then(response => {
                this.description = response.data.data;
            });

            api.get(`api/software/${this.software.id}/project.json`).then(response => {
                this.projects = response.data.collection;
            });

            this.software.parameters.forEach(function(parameter) {
                api.get(`api/domain/be.cytomine.processing.SoftwareParameter/${parameter.id}/description.json`).then(response => {
                    parameter.description = response.data.data;
                });

                api.get(`api/softwareparameter/${parameter.id}/constraint.json`).then(response => {
                    parameter.constraints = response.data.collection;
                })
            });

            this.showParametersMoreInfo = new Array(this.software.parameters.length).fill(false);
            this.showParameters = new Array(this.software.parameters.length).fill(false);
            if (this.showParameters.length > 0)
                this.showParameters[0] = true
        }
    }
</script>

<style scoped>
    .row {
        margin-right: -14px;
    }

    ol {
        list-style: decimal;
    }

    .panel-heading h3 {
        padding-top: 2.5px;
    }

    .label-killed {
        background-color: black;
    }
</style>
