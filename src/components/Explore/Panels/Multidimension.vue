<template>
    <section>
        <h4>
            <i class="fas fa-images"></i> Multidimension
        </h4>
        <div class="form-horizontal">
            <div class="form-group">
                <label :for="'property-color'+viewerId" class="col-sm-4 control-label">Image group</label>
                <div class="col-sm-8">
                    <select class="form-control"
                            v-model="selected" name="imageGroupSelect">
                        <option :value="{}">Select an image group</option>
                        <option v-for="sequence in imageSequences" :key="sequence.id" :value="sequence">
                            {{getImageGroupById(sequence.imageGroup).name}}
                        </option>
                    </select>
                </div>
            </div>
        </div>

        <template v-if="selected !== {} && selectedImageGroup">
            <div>
                <dl>
                    <template v-if="selectedImageGroup.channels && selectedImageGroup.channels.length > 1">
                        <dt>Channel (c)
                            {{prettyPrintDimensions(selectedImageGroup.channels)}}
                        </dt>
                        <dd>
                            <div style="width: 100px;" class="pull-left">
                                <span class="label label-default">{{currentChannel}}</span>
                                <div class="pull-right">
                                    <button class="btn btn-xs btn-default" @click="addToCurrentChannel(-1)"
                                            :disabled="currentChannel === 0">
                                        <i class="fas fa-angle-left"></i>
                                    </button>
                                    <button class="btn btn-xs btn-default" @click="addToCurrentChannel(1)"
                                            :disabled="currentChannel === selectedImageGroup.channels.length - 1">
                                        <i class="fas fa-angle-right"></i>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <div style="width: calc(100% - 110px);" class="pull-right">
                                    <vue-slider v-model="currentChannel"
                                                :piecewise="selectedImageGroup.channels.length < 300"
                                                :piecewiseLabel="selectedImageGroup.channels.length < 300"
                                                tooltip="hover" tooltip-dir="left" :lazy="true"
                                                :data="selectedImageGroup.channels" ref="channelslider">
                                        <template slot="label" slot-scope="{ label, index, active, first, last }">
                                        <span :class="['vue-slider-piecewise-label', { active }]"
                                              v-if="showLabel(index, currentChannel) || first || last">
                                            {{ label }}
                                        </span>
                                        </template>
                                    </vue-slider>

                                </div>

                            </div>

                        </dd>
                    </template>

                    <template v-if="selectedImageGroup.zStacks && selectedImageGroup.zStacks.length > 1">
                        <dt>Slice (z)
                            {{prettyPrintDimensions(selectedImageGroup.zStacks)}}
                        </dt>
                        <dd>
                            <div style="width: 100px;" class="pull-left">
                                <span class="label label-default">{{currentZStack}}</span>
                                <div class="pull-right">
                                    <button class="btn btn-xs btn-default" @click="addToCurrentZstack(-1)"
                                            :disabled="currentZStack === 0">
                                        <i class="fas fa-angle-left"></i>
                                    </button>
                                    <button class="btn btn-xs btn-default" @click="addToCurrentZstack(1)"
                                            :disabled="currentZStack === selectedImageGroup.zStacks.length - 1">
                                        <i class="fas fa-angle-right"></i>
                                    </button>
                                </div>
                            </div>
                            <div style="width: calc(100% - 110px);" class="pull-right">
                                <vue-slider v-model="currentZStack"
                                            :piecewise="selectedImageGroup.zStacks.length < 300"
                                            :piecewiseLabel="selectedImageGroup.zStacks.length < 300"
                                            tooltip="hover" tooltip-dir="left" :lazy="true"
                                            :data="selectedImageGroup.zStacks" ref="zstackslider">
                                    <template slot="label" slot-scope="{ label, index, active, first, last }">
                                        <span :class="['vue-slider-piecewise-label', { active }]"
                                              v-if="showLabel(index, currentZStack) || first || last">
                                            {{ label }}
                                        </span>
                                    </template>
                                </vue-slider>
                            </div>
                        </dd>
                    </template>

                    <template v-if="selectedImageGroup.times && selectedImageGroup.times.length > 1">
                        <dt>Time (t)
                            {{prettyPrintDimensions(selectedImageGroup.times)}}
                        </dt>
                        <dd>
                            <div style="width: 100px;" class="pull-left">
                                <span class="label label-default">{{currentTime}}</span>
                                <div class="pull-right">
                                    <button class="btn btn-xs btn-default" @click="addToCurrentTime(-1)"
                                            :disabled="currentTime === 0">
                                        <i class="fas fa-angle-left"></i>
                                    </button>
                                    <button class="btn btn-xs btn-default" @click="addToCurrentTime(1)"
                                            :disabled="currentTime === selectedImageGroup.times.length - 1">
                                        <i class="fas fa-angle-right"></i>
                                    </button>
                                </div>
                            </div>
                            <div style="width: calc(100% - 110px);" class="pull-right">
                                <vue-slider v-model="currentTime"
                                            :piecewise="selectedImageGroup.times.length < 300"
                                            :piecewiseLabel="selectedImageGroup.times.length < 300"
                                            tooltip="hover" tooltip-dir="left" :lazy="true"
                                            :data="selectedImageGroup.times" ref="timeslider">
                                    <template slot="label" slot-scope="{ label, index, active, first, last }">
                                        <span :class="['vue-slider-piecewise-label', { active }]"
                                              v-if="showLabel(index, currentTime) || first || last">
                                            {{ label }}
                                        </span>
                                    </template>
                                </vue-slider>
                            </div>
                        </dd>
                    </template>
                </dl>
            </div>
            <div class="clearfix"></div>
            <spectrum :image-group="selectedImageGroup" :coordinates="clickCoordinate" :element-width="elementWidth"
                      @activeStateChanged="refreshSliders"></spectrum>
            <!--<overlay :image-group="selectedImageGroup" :image-sequence="selectedSequence"></overlay>-->
        </template>

    </section>
</template>

<script>
    import vueSlider from 'vue-slider-component'
    import debounce from "lodash.debounce";

    import Overlay from './Multidimension/Overlay'
    import Spectrum from "./Multidimension/Spectrum";

    export default {
        name: 'Multidimension',
        components: {
            Spectrum,
            Overlay,
            vueSlider,
        },
        props: [
            'viewerId',
            'imageGroups',
            'imageSequences',
            'selectedSequence',
            'clickCoordinate',
            'elementWidth',
            'active',
            'selectedChannel',
            'selectedZStack',
            'selectedTime'
        ],
        data() {
            return {}
        },
        computed: {
            selected: {
                get: function () {
                    return this.selectedSequence;
                },
                set: function (newValue) {
                    this.$emit('update:selectedSequence', newValue)
                }
            },
            selectedImageGroup() {
                return this.getImageGroupById(this.selectedSequence.imageGroup)
            },
            currentChannel: {
                get: function () {
                    return this.selectedChannel;
                },
                set: function (newValue) {
                    console.log(newValue);
                    this.debouncedChangeSequence({c: newValue, z: this.currentZStack, t: this.currentTime})
                }
            },
            currentZStack: {
                get: function () {
                    return this.selectedZStack;
                },
                set: function (newValue) {
                    console.log(newValue);
                    this.debouncedChangeSequence({c: this.currentChannel, z: newValue, t: this.currentTime})
                }
            },
            currentTime: {
                get: function () {
                    return this.selectedTime;
                },
                set: function (newValue) {
                    console.log(newValue);
                    this.debouncedChangeSequence({c: this.currentChannel, z: this.currentZStack, t: newValue})
                }
            },
        },
        watch: {
            elementWidth() {
                this.refreshSliders();
            },
            active(newValue) {
                if (newValue)
                    this.refreshSliders();
            },
        },
        methods: {
            getImageGroupById(imageGroupId) {
                return this.imageGroups.find(group => {
                    return group.id === imageGroupId;
                });
            },
            prettyPrintDimensions(array) {
                if (array.length === 0) {
                    return "[]";
                }
                let ini = array[0];
                let result = "[" + ini;

                let nbConsecutiveValues = 0;
                for (let i = 1; i < array.length; ++i) {
                    if (array[i] === ini + 1) {
                        nbConsecutiveValues++;
                        ini++;
                    }
                    else {
                        if (nbConsecutiveValues == 0)
                            result += ", " + array[i];
                        else {
                            nbConsecutiveValues = 0;
                            result += ".." + ini + ", " + array[i];
                        }
                        ini = array[i];
                    }
                }
                if (nbConsecutiveValues != 0)
                    result += ".." + array[array.length - 1] + "]";
                else
                    result += "]";

                if (result.length > 60)
                    result = "";

                return result;
            },
            showLabel(index, array) {
                let length = array.length;
                if (index === 0 || index === length - 1 || length <= 10)
                    return true;
                else {
                    return index % parseInt(length / 10) === 0;
                }
            },
            addToCurrentChannel(value) {
                let index = this.$refs.channelslider.getIndex();
                this.$refs.channelslider.setIndex(index + value)
            },
            addToCurrentZstack(value) {
                let index = this.$refs.zstackslider.getIndex();
                this.$refs.zstackslider.setIndex(index + value)
            },
            addToCurrentTime(value) {
                let index = this.$refs.timeslider.getIndex();
                this.$refs.timeslider.setIndex(index + value)
            },
            changeSequence(newSequence) {
                this.$emit('changeSequence', newSequence)
            },
            refreshSliders() {
                // Use an interval as we don't know when Plotly graph object has been erased (happens X ms after active=false)
                let retries = 0;
                let interval = setInterval(() => {
                    retries++;
                    if (this.$refs.channelslider)
                        this.$refs.channelslider.refresh();

                    if (this.$refs.zstackslider)
                        this.$refs.zstackslider.refresh();

                    if (this.$refs.timeslider)
                        this.$refs.timeslider.refresh();
                    if (retries == 5)
                        clearInterval(interval);
                }, 50);

            }
        },
        created() {
            this.debouncedChangeSequence = debounce(this.changeSequence, 100);
        }
    }
</script>


<style scoped>
    dt {
        clear: both;
        padding: 6px 0 3px 0;
    }

    dl {
        padding-bottom: 1em;
        clear: both;
    }
</style>
