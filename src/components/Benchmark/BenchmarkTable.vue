<template>
    <div>
        <div v-if="show" class="table-responsive">
            <table class="table table-condensed table-hover table-bordered">
                <thead>
                <tr>
                    <th colspan="2"></th>
                    <th v-for="job in filteredJobColumns">
                        <a :href="`#tabs-algos-${job.project}-${job.software}-${job.id}`">Job #{{job.number}} ({{job.id}})</a><br>
                        <a :href="`#software-${job.software}`">{{softwareById(job.software).fullName}}</a><br>
                        by {{job.username}}<br>
                        at <date-item :value="job.created"></date-item>
                    </th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="header in headerColumn" v-if="header.type == 'parameter'">
                    <th colspan="2">{{header.data.humanName}}</th>
                    <td v-for="job in filteredJobColumns">
                        <span v-if="job[header.id] != undefined">
                            {{job[header.id].value}}
                        </span>
                        <span class="no-parameter-cell" v-else>*</span>
                    </td>
                </tr>
                <template v-for="header in headerColumn" v-if="header.type == 'metric'">
                    <tr v-for="(aggregate, index) in aggregates">
                        <th v-if="index == 0" :rowspan="aggregates.length">{{header.data.name}} ({{header.data.shortName}})</th>
                        <th>{{aggregate.name}}</th>

                        <td v-for="job in filteredJobColumns">
                            <span v-if="job['aggregate-'+header.id+'-'+aggregate.code] != undefined">
                                {{job['aggregate-'+header.id+'-'+aggregate.code]}}
                            </span>
                            <span class="no-metric-cell" v-else>N/A</span>
                        </td>
                    </tr>

                </template>
                </tbody>
            </table>
        </div>
        <hr/>
    </div>
</template>

<script>
    import DateItem from "../Datatable/DateItem";
    export default {
        name: "BenchmarkTable",
        components: {DateItem},
        props: [
            'parameters',
            'headerColumn',
            'jobColumns',
            'softwares',
            'aggregates'
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
</style>
