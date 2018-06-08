<template>
    <div>
        <h3>Multidimension</h3>
        <div class="input-group">
            <span class="input-group-addon">Current image group</span>
            <select class="btn btn-default" style="width: 100%"
                    @change="setImageGroup(currentMap.imageId, imageGroupSelectedId)"
                    v-model="imageGroupSelectedId" name="imageGroupSelect" id="imageGroupSelect">
                <option :value="undefined">Select an image group</option>
                <option v-for="sequence in imageSequences" :key="sequence.id" :value="sequence.imageGroup">
                    {{getImageGroupName(sequence.imageGroup)}}
                </option>
            </select>
        </div>
        <template v-if="imageGroupSelected">
            <div>
                <dl>
                    <template v-if="imageGroupSelected.channel && imageGroupSelected.channel.length > 1">
                        <dt>Channel (c)
                            {{prettyPrintDimensions(imageGroupSelected.channel)}} </dt>
                        <dd>
                            <div style="width: 100px;" class="pull-left">
                                <span class="label label-default">{{currentSequence.channel}}</span>
                                <div class="pull-right">
                                    <button class="btn btn-xs btn-default" @click="addToCurrentChannel(1)" :disabled="currentSequence.channel === imageGroupSelected.channel.length - 1">+</button>
                                    <button class="btn btn-xs btn-default" @click="addToCurrentChannel(-1)" :disabled="currentSequence.channel === 0">-</button>
                                </div>
                            </div>
                            <div style="width: calc(100% - 110px);" class="pull-right">
                                <vue-slider v-model="sequenceSelected.channel" :piecewise="imageGroupSelected.channel.length < 300" :piecewiseLabel="imageGroupSelected.channel.length < 300"
                                            tooltip="hover" tooltip-dir="left" :lazy="true"
                                            :data="imageGroupSelected.channel" ref="channelslider">
                                    <template slot="label" slot-scope="{ label, index, active }">
                              <span :class="['vue-slider-piecewise-label', { active }]"
                                    v-if="showLabel(index, imageGroupSelected.channel)">
                                {{ label }}
                              </span>
                                    </template>
                                </vue-slider>
                            </div>
                        </dd>
                    </template>
                    <template v-if="imageGroupSelected.zStack && imageGroupSelected.zStack.length > 1">
                        <dt>Slice (z)
                            {{prettyPrintDimensions(imageGroupSelected.zStack)}}</dt>
                        <dd>
                            <div style="width: 100px;" class="pull-left">
                                <span class="label label-default">{{currentSequence.zStack}}</span>
                                <div class="pull-right">
                                    <button class="btn btn-xs btn-default" @click="addToCurrentZstack(1)" :disabled="currentSequence.zStack === imageGroupSelected.zStack.length - 1">+</button>
                                    <button class="btn btn-xs btn-default" @click="addToCurrentZstack(-1)" :disabled="currentSequence.zStack === 0">-</button>
                                </div>
                            </div>
                            <div style="width: calc(100% - 110px);" class="pull-right">
                                <vue-slider v-model="sequenceSelected.zStack" :piecewise="imageGroupSelected.zStack.length < 300" :piecewiseLabel="imageGroupSelected.zStack.length < 300"
                                            tooltip="hover" tooltip-dir="left" :lazy="true"
                                            :data="imageGroupSelected.zStack" ref="zstackslider">
                                    <template slot="label" slot-scope="{ label, index, active }">
                              <span :class="['vue-slider-piecewise-label', { active }]"
                                    v-if="showLabel(index, imageGroupSelected.zStack)">
                                {{ label }}
                              </span>
                                    </template>
                                </vue-slider>
                            </div>
                        </dd>
                    </template>
                    <template v-if="imageGroupSelected.time && imageGroupSelected.time.length > 1">
                        <dt>Time (t)
                            {{prettyPrintDimensions(imageGroupSelected.time)}}</dt>
                        <dd>
                            <div style="width: 100px;" class="pull-left">
                                <span class="label label-default">{{currentSequence.time}}</span>
                                <div class="pull-right">
                                    <button class="btn btn-xs btn-default" @click="addToCurrentTime(1)" :disabled="currentSequence.time === imageGroupSelected.time.length - 1">+</button>
                                    <button class="btn btn-xs btn-default" @click="addToCurrentTime(-1)" :disabled="currentSequence.time === 0">-</button>
                                </div>
                            </div>
                            <div style="width: calc(100% - 110px);" class="pull-right">
                                <vue-slider v-model="sequenceSelected.time" :piecewise="imageGroupSelected.time.length < 300" :piecewiseLabel="imageGroupSelected.time.length < 300"
                                            tooltip="hover" tooltip-dir="left" :lazy="true"
                                            :data="imageGroupSelected.time" ref="timeslider">
                                    <template slot="label" slot-scope="{ label, index, active }">
                              <span :class="['vue-slider-piecewise-label', { active }]"
                                    v-if="showLabel(index, imageGroupSelected.time)">
                                {{ label }}
                              </span>
                                    </template>
                                </vue-slider>
                            </div>
                        </dd>
                    </template>
                </dl>
            </div>
            <div style="clear: both;"></div>
            <!--<overlay :imageSequence="currentSequence" :imageGroup="imageGroup" :currentMap="currentMap"-->
                     <!--:imsBaseUrl="imsBaseUrl" :filterUrl="filterUrl"></overlay>-->
            <spectra :imageSequence="currentSequence" :imageGroup="imageGroupSelected" :mousePosition="mousePosition"
                     :currentMap="currentMap"></spectra>
        </template>

    </div>
</template>

<script>
    import Spectra from './Multidimension/Spectra'
    import Overlay from './Multidimension/Overlay'
    import vueSlider from 'vue-slider-component'

    export default {
        name: 'Multidimension',
        components: {
            Spectra,
            Overlay,
            vueSlider,
        },
        props: [
            'currentMap',
            'imsBaseUrl',
            'filterUrl',
            'imageGroups',
            'mousePosition',
        ],
        data() {
            return {
                imageSequences: [],
                imageGroup: [], //TODO: delete
                sequenceSelected: undefined,
                imageGroupSelected: undefined,
                imageGroupSelectedId: undefined,
                currentSequence: {},
            }
        },
        watch: {
            sequenceSelected: {
                handler(newSequence, oldSequence) {
                    api.get(`/api/imagegroup/${newSequence.imageGroup}/${newSequence.channel}/${newSequence.zStack}/0/${newSequence.time}/imagesequence.json`).then(response => {
                        this.currentSequence = response.data;
                        this.$emit('changeImage', this.currentSequence.model);

                        api.get(`/api/imageinstance/${this.currentMap.imageId}/imagesequence.json`).then(data => {
                            this.imageSequences = data.data.collection;
                        });
                    })
                },
                deep: true
            },
        },
        methods: {
            getImageGroupName(imageGroupId) {
                let index = this.imageGroups.findIndex(group => {
                    return group.id === imageGroupId;
                });

                return this.imageGroups[index].name;
            },
            setImageGroup(imageId, imageGroupId) {
                this.imageGroupSelected = this.imageGroups.find(group => {
                    return group.id === imageGroupId;
                });
                this.imageGroupSelectedId = (this.imageGroupSelected) ? this.imageGroupSelected.id : undefined;

                if (this.imageGroupSelected) {
                    api.get(`/api/imagegroup/${imageGroupId}/characteristics.json`).then(response => {
                        if (response.data.channel) {
                            this.$set(this.imageGroupSelected, 'channel', response.data.channel);
                            this.$set(this.imageGroupSelected, 'zStack', response.data.zStack);
                            this.$set(this.imageGroupSelected, 'time', response.data.time);
                            this.$set(this.imageGroupSelected, 'slice', response.data.slice);
                        }
                    });

                    let index = this.imageSequences.findIndex(sequence => {
                        return sequence.imageGroup === imageGroupId;
                    });
                    this.currentSequence = this.imageSequences[index];
                    this.sequenceSelected = this.currentSequence;
                }

                this.$emit('imageGroupHasChanged', imageGroupId);
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
                this.currentSequence.channel = this.imageGroupSelected.channel[index + value];
                this.$refs.channelslider.setValue(this.currentSequence.channel)
            },
            addToCurrentZstack(value) {
                let index = this.$refs.zstackslider.getIndex();
                this.currentSequence.zStack = this.imageGroupSelected.zStack[index + value];
                this.$refs.zstackslider.setValue(this.currentSequence.zStack)
            },
            addToCurrentTime(value) {
                let index = this.$refs.timeslider.getIndex();
                this.currentSequence.time = this.imageGroupSelected.time[index + value];
                this.$refs.timeslider.setValue(this.currentSequence.time)
            },
        },
        created() {
            api.get(`/api/imageinstance/${this.currentMap.imageId}/imagesequence.json`).then(data => {
                this.imageSequences = data.data.collection;
            });

            this.setImageGroup(this.currentMap.imageId, this.currentMap.imageGroup)
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
