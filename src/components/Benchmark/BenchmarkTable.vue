<template>
    <div>
        <div v-if="show" class="table-responsive">
            <table class="table table-condensed table-hover table-bordered table-striped">
                <thead>
                <tr>
                    <th colspan="2" class="border-right"></th>
                    <th v-for="job in filteredJobColumns">
                        <button type="button" class="close pull-right" @click="removeJob(job.id)"><span aria-hidden="true">&times;</span></button>
                        <a :href="`#tabs-algos-${job.project}-${job.software}-${job.id}`">Job #{{job.number}} ({{job.id}}) <i class="fas fa-star" v-if="job.favorite"></i></a><br>
                        <a :href="`#software-${job.software}`">{{softwareById(job.software).fullName}}</a><br>
                        by {{job.username}}<br>
                        at <date-item :value="job.created"></date-item>
                    </th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="header in headerColumn" v-if="header.type == 'parameter' && showParameters">
                    <th colspan="2" class="border-right">
                        <sort-button :sort="sort" :field="header.id" @changeSort="changeSort"></sort-button>
                        {{header.data.humanName}}
                    </th>
                    <td v-for="job in filteredJobColumns">
                        <span v-if="job[header.id] != undefined">
                            {{job[header.id]}}
                        </span>
                        <span class="no-parameter-cell text-muted" v-else><small>*</small></span>
                    </td>
                </tr>
                <template v-for="header in headerColumn" v-if="header.type == 'metric'">
                    <tr v-for="(aggregate, index) in aggregates">
                        <th v-if="index == 0" :rowspan="aggregates.length">{{header.data.name}} ({{header.data.shortName}})</th>
                        <th class="border-right">
                            <sort-button :sort="sort" :field="'aggregate-'+header.data.id+'-'+aggregate.code" @changeSort="changeSort"></sort-button>
                            {{aggregate.name}}
                        </th>

                        <td v-for="job in filteredJobColumns">
                            <span v-if="job['aggregate-'+header.id+'-'+aggregate.code] != undefined">
                                {{job['aggregate-'+header.id+'-'+aggregate.code].toFixed(2)}}
                            </span>
                            <span class="no-metric-cell text-muted" v-else><small>N/A</small></span>
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
    import SortButton from "./SortButton";
    export default {
        name: "BenchmarkTable",
        components: {
            DateItem,
            SortButton
        },
        props: [
            'parameters',
            'headerColumn',
            'jobColumns',
            'softwares',
            'aggregates',
            'sort',
            'showParameters'
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
            changeSort(payload) {
                this.$emit('changeSort', payload)
            },
            removeJob(id) {
                this.$emit('removeJob', id)
            }
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

    .border-right {
        border-right-width: 2px;
    }

    .border-top {
        border-top-width: 2px;
    }
</style>
