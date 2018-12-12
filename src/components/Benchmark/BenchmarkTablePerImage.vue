<template>
    <div>
        <div>
            <div class="pull-right align-chevron">
                <button class=" option-desc btn btn-link" @click="show=!show">
                    <span v-if="show"><i class="fas fa-chevron-up"></i></span>
                    <span v-else><i class="fas fa-chevron-down"></i></span>
                </button>
            </div>

            <img class="option-image" :src="image.thumb">
            <h4 class="option-desc">
                {{ image.instanceFilename }}
            </h4>
        </div>
        <div v-if="show" class="table-responsive">
            <table class="table table-condensed table-hover table-bordered">
                <thead>
                <tr>
                    <th></th>
                    <th v-for="job in filteredJobColumns">
                        <a :href="`#tabs-algos-${job.project}-${job.software}-${job.id}`">Job #{{job.number}} ({{job.id}})</a><br>
                        <a :href="`#software-${job.software}`">{{softwareById(job.software).fullName}}</a><br>
                        by {{job.username}}<br>
                        at <date-item :value="job.created"></date-item>
                    </th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="header in headerColumn">
                    <template v-if="header.type == 'parameter'">
                        <th>{{header.data.humanName}}</th>
                    </template>
                    <template v-else>
                        <th>{{header.data.name}} ({{header.data.shortName}})</th>
                    </template>

                    <td v-for="job in filteredJobColumns">
                        <template v-if="header.type == 'parameter'">
                            <span v-if="job[header.id] != undefined">
                                {{job[header.id].value}}
                            </span>
                            <span class="no-parameter-cell" v-else>*</span>
                        </template>
                        <template v-else>
                            <span v-if="job[image.id+'-'+header.id] != undefined">
                                {{job[image.id+'-'+header.id].value}}
                            </span>
                            <span class="no-metric-cell" v-else>N/A</span>
                        </template>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
        <hr/>
    </div>
</template>

<script>
    import DateItem from "../Datatable/DateItem";
    export default {
        name: "BenchmarkTablePerImage",
        components: {DateItem},
        props: [
            'image',
            'parameters',
            'headerColumn',
            'jobColumns',
            'softwares'
        ],
        data() {
            return {
                show: true,
            }
        },
        computed: {
            filteredJobColumns() {
                return this.jobColumns
            }
        },
        methods: {
            softwareById(termId) {
                return this.softwares.find(term => term.id == termId);
            },
        }
    }
</script>

<style scoped>
    .option-image {
        display: inline-block;
        vertical-align: middle;
        max-height: 60px;
        max-width: 128px;
        margin-right: 10px;
    }

    .option-desc {
        display: inline-block;
        vertical-align: middle;
    }

    .align-chevron {
        top: 100%;
        transform: translateY(50%);
    }
</style>
