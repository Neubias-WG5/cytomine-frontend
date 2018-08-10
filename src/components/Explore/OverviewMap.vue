<template>
    <div class="overview-container">
        <div v-show="showOverviewMap" :id="overviewMapId"></div>
        <button class="btn btn-default" style="width: 100%;" id="overview-map-collapse"
                @click="showOverviewMap = !showOverviewMap" title="Show/Hide overview map">
            <span :class="`glyphicon glyphicon-chevron-${showOverviewMap ? 'right' : 'left'}`"></span>
        </button>
    </div>
</template>

<script>
    import OverviewMap from 'ol/control/overviewmap';
    import Projection from 'ol/proj/projection';
    import View from 'ol/view';
    import uuid from 'uuid';

    export default {
        name: 'OverviewMap',
        data() {
            return {
                overviewMap: {},
                showOverviewMap: true,
                overviewMapId: uuid(),
            }
        },
        props: [
            'viewerId',
            'image',
            'elementWidth',
            'elementHeight',
        ],
        computed: {
            height() {
                return 200 / this.elementWidth * this.elementHeight;
            }
        },
        watch: {
            elementWidth() {
                if (this.overviewMap && this.overviewMap.getOverviewMap())
                    this.overviewMap.getOverviewMap().setSize([200, this.height]);
            },
            elementHeight() {
                if (this.overviewMap && this.overviewMap.getOverviewMap())
                    this.overviewMap.getOverviewMap().setSize([200, this.height]);
            },
            'image.id'() {
                this.initOverviewMap()
            }
        },
        methods: {
            initOverviewMap() {
                let interval = setInterval(() => {
                    if (this.overviewMap.hasOwnProperty('ol_uid')) {
                        this.$openlayers.getMap(this.overviewMap.get('mapId')).removeControl(this.overviewMap);
                    }

                    if (this.$openlayers.getMap(this.viewerId) != undefined) {
                        let viewportSize = this.$openlayers.getMap(this.viewerId).getSize();
                        this.overviewMap = new OverviewMap({
                            collapsed: true,
                            target: this.overviewMapId,
                            view: new View({
                                projection: new Projection({
                                    code: 'CYTO',
                                    extent: [0, 0, this.image.width, this.image.height],
                                    worldExtent: [0, 0, viewportSize[0], viewportSize[1]]
                                }),
                                center: [this.image.width / 2, this.image.height / 2],
                            }),
                        });
                        this.overviewMap.set('mapId', this.viewerId);


                        this.$openlayers.getMap(this.viewerId).addControl(this.overviewMap);
                        this.overviewMap.getOverviewMap().setSize([200, this.height]);
                        clearInterval(interval);
                    }}, 100
                );
            },

        },
        mounted() {
            this.initOverviewMap();
        },
    }
</script>

<style>
    .overview-container {
        position: absolute;
        top: 0;
        right: 15px;
        z-index: 9999;
        border: 3px solid black;
        background: grey;
        margin-top: 15px;
    }

    .ol-overviewmap-map {
        width: 200px;
    }

    .ol-overviewmap .ol-overviewmap-box {
        border: 2px solid red;
    }

    button[title="Overview map"] {
        display: none;
    }
</style>

