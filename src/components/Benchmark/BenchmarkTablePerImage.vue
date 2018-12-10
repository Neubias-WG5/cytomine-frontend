<template>
    <div>
        <div>
            <button class="pull-right option-desc btn btn-default" @click="show=!show">
                <span v-if="show">Hide</span>
                <span v-else>Show</span>
            </button>
            <img class="option-image" :src="image.thumb">
            <h4 class="option-desc">
                {{ image.instanceFilename }}
            </h4>
        </div>
        <div v-if="show">
            <table class="table table-condensed table-hover table-bordered">
                <thead>
                <tr>
                    <td></td>
                    <td>Job 1</td>
                </tr>
                </thead>
                <tbody>
                <tr v-for="metric in metrics">
                    <td>{{metric.name}} ({{metric.shortName}})</td>
                    <td>123</td>
                </tr>
                </tbody>
            </table>
        </div>
        <hr/>
    </div>
</template>

<script>
    export default {
        name: "BenchmarkTablePerImage",
        props: [
            'image',
            'metrics',
            'metricResults',
            'jobs'
        ],
        data() {
            return {
                show: true
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
</style>
