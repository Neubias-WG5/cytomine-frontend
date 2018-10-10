<template>
    <div class="text-center" v-if="task">
        <progress-bar v-model="progress" striped active label/>
        {{comment}}
    </div>
</template>

<script>
    import ProgressBar from "uiv/src/components/progressbar/ProgressBar";

    export default {
        name: "Task",
        components: {ProgressBar},
        data() {
            return {
                timer: null,
            }
        },
        props: [
            'task', // sync
            'timeout'
        ],
        computed: {
            progress() {
                return this.task.progress;
            },
            comment() {
                return this.task.comments[0]
            }
        },
        watch: {},
        methods: {
            getTask() {
                if (this.task) {
                    api.get(`api/task/${this.task.id}.json`).then(response => {
                        this.$emit('update:task', response.data);
                        if (response.data.progress == 100)
                            clearInterval(this.timer);
                    })
                }
            }
        },
        mounted() {
            this.timer = setInterval(this.getTask.bind(this), this.timeout);
        },
        beforeDestroy() {
            clearInterval(this.timer);
        }
    }
</script>

<style scoped>

</style>
