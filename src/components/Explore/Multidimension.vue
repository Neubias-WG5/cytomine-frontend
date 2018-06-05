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
            <div class="form-horizontal">
                <div class="form-group" v-if="imageGroupSelected.channel.length > 1">
                    <div class="col-xs-4 control-label">Channel (c)
                        {{prettyPrintDimensions(imageGroupSelected.channel)}}
                    </div>
                    <div class="col-xs-1 control-label">
                        <span class="label label-default">{{currentSequence.channel}}</span>
                    </div>
                    <div class="col-xs-7">
                        <vue-slider v-model="sequenceSelected.channel" :piecewise="true" :piecewiseLabel="true"
                                    tooltip="hover" tooltip-dir="left" :lazy="true"
                                    :data="imageGroupSelected.channel"></vue-slider>
                    </div>
                </div>
                <div class="form-group" v-if="imageGroupSelected.zStack.length > 1">
                    <div class="col-xs-4 control-label">Slice (z) {{prettyPrintDimensions(imageGroupSelected.zStack)}}
                    </div>
                    <div class="col-xs-1 control-label">
                        <span class="label label-default">{{currentSequence.zStack}}</span>
                    </div>
                    <div class="col-xs-7">
                        <vue-slider v-model="sequenceSelected.zStack" :piecewise="true" :piecewiseLabel="true"
                                    tooltip="hover" tooltip-dir="left" :lazy="true"
                                    :data="imageGroupSelected.zStack"></vue-slider>
                    </div>
                </div>
                <div class="form-group" v-if="imageGroupSelected.time.length > 1">
                    <div class="col-xs-4 control-label">Time frame (t)
                        {{prettyPrintDimensions(imageGroupSelected.time)}}
                    </div>
                    <div class="col-xs-1 control-label">
                        <span class="label label-default">{{currentSequence.time}}</span>
                    </div>
                    <div class="col-xs-7">
                        <vue-slider v-model="sequenceSelected.time" :piecewise="true" :piecewiseLabel="true"
                                    tooltip="hover" tooltip-dir="left" :lazy="true"
                                    :data="imageGroupSelected.time"></vue-slider>
                    </div>
                </div>
            </div>

            <overlay :imageSequence="currentSequence" :imageGroup="imageGroup" :currentMap="currentMap"
                     :imsBaseUrl="imsBaseUrl" :filterUrl="filterUrl"></overlay>
            <spectra :imageSequence="currentSequence" :imageGroup="imageGroup" :currentMap="currentMap"></spectra>
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
                            result += "," + array[i];
                        else {
                            nbConsecutiveValues = 0;
                            result += ".." + ini + "," + array[i];
                        }
                        ini = array[i];
                    }
                }
                if (nbConsecutiveValues != 0)
                    result += ".." + array[array.length - 1] + "]";
                else
                    result += "]";
                return result;
            }
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

</style>
