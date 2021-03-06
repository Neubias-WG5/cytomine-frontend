<template>
    <div>
        <div>
            <div class="pull-right align-chevron">
                <button class=" option-desc btn btn-link" @click="show=!show">
                    <span v-if="show"><i class="fas fa-chevron-up"></i></span>
                    <span v-else><i class="fas fa-chevron-down"></i></span>
                </button>
            </div>

            <a style="color:inherit;" :href="getImageUrl(image)"><img class="option-image" :src="image.thumb"></a>
            <h4 class="option-desc">
                <a style="color:inherit;" :href="getImageUrl(image)">{{ image.instanceFilename }}</a>
            </h4>
        </div>
        <div v-if="show" class="table-responsive">
            <table class="table table-condensed table-hover table-bordered table-striped">
                <thead>
                <tr>
                    <th class="border-right"></th>
                    <th v-for="job in jobColumns">
                        <button type="button" class="close pull-right" @click="removeJob(job.id)"><span aria-hidden="true">&times;</span></button>
                        <a :href="`#tabs-algos-${job.project}-${job.software}-${job.id}`">Job #{{job.number}} ({{job.id}}) <i class="fas fa-star" v-if="job.favorite"></i></a><br>
                        <a :href="`#software-${job.software}`">{{softwareById(job.software).fullName}}</a><br>
                        by {{job.username}}<br>
                        at <date-item :value="job.created"></date-item>
                    </th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="header in headerColumn" v-if="(header.type == 'parameter' && showParameters) || header.type == 'metric'">
                    <template v-if="header.type == 'parameter'">
                        <th class="border-right">
                            <sort-button :sort="sort" :field="header.id" @changeSort="changeSort"></sort-button>
                            {{header.data.humanName}}
                        </th>
                    </template>
                    <template v-else-if="header.type == 'metric'">
                        <th>
                            <sort-button :sort="sort" :field="image.id+'-'+header.id" @changeSort="changeSort"></sort-button>
                            {{header.data.name}} ({{header.data.shortName}})
                        </th>
                    </template>

                    <td v-for="job in jobColumns">
                        <template v-if="header.type == 'parameter'">
                            <span v-if="job[header.id] != undefined">
                                {{job[header.id]}}
                            </span>
                            <span class="no-parameter-cell text-muted" v-else><small>*</small></span>
                        </template>
                        <template v-else-if="header.type == 'metric'">
                            <span v-if="job[image.id+'-'+header.id] != undefined">
                                {{job[image.id+'-'+header.id]}}
                            </span>
                            <span class="no-metric-cell text-muted" v-else><small>N/A</small></span>
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
    import SortButton from "./SortButton";
    export default {
        name: "BenchmarkTablePerImage",
        components: {SortButton, DateItem},
        props: [
            'image',
            'parameters',
            'headerColumn',
            'jobColumns',
            'softwares',
            'sort',
            'showParameters'
        ],
        data() {
            return {
                show: true,
            }
        },
        computed: {

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
            },
            getImageUrl(image) {
                if (image['class'].includes('ImageGroup'))
                    return '#tabs-imagegroup-'+image.project+'-'+image.id;
                else
                    return '#tabs-image-'+image.project+'-'+image.id+'-0'
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

    .align-chevron {
        top: 100%;
        transform: translateY(50%);
    }

    .border-right {
        border-right-width: 2px;
    }

    .border-top {
        border-top-width: 2px;
    }
</style>
