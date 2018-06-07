<template>
    <div :style="`height:${elementHeightPercentage}%;width:${elementWidthPercentage}%;`" class="map">
        <div  @mousemove="sendView" @mousewheel="sendView"
             :id="currentMap.id" ref="exploreMap">
        </div>
        <div class="controls" :id="'controls-'+currentMap.id"></div>
        <interactions v-show="this.lastEventMapId == this.currentMap.id" @updateLayers="setUpdateLayers"
                      @featureSelected="setFeatureSelected" :currentMap="currentMap" :isReviewing="isReviewing"
                      @updateAnnotationsIndex="setUpdateAnnotationsIndex" :vectorLayersOpacity="vectorLayersOpacity">
        </interactions>
        <overview-map :currentMap="currentMap" :elementHeight="elementHeight" :elementWidth="elementWidth"></overview-map>
        <div>
            <div v-show="this.lastEventMapId == this.currentMap.id" class="bottom-panel btn-group" role="group">
                <button v-if="mustBeShown('project-explore-info')" @click="setShowComponent('informations')"
                        :class="['btn', 'btn-default', {active: showComponent == 'informations' }]">
                    <span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span>
                </button>
                <button v-if="mustBeShown('project-explore-link') && this.maps.length > 1"
                        @click="setShowComponent('linkmap')"
                        :class="['btn', 'btn-default', {active: showComponent == 'linkmap' }]">
                    <span class="glyphicon glyphicon-link" aria-hidden="true"></span>
                </button>
                <button v-if="mustBeShown('project-explore-image-layers') && this.filters.length > 1"
                        @click="setShowComponent('filter')"
                        :class="['btn', 'btn-default', {active: showComponent == 'filter' }]">
                    <span class="glyphicon glyphicon-filter" aria-hidden="true"></span>
                </button>
                <button v-if="mustBeShown('project-explore-digital-zoom')" @click="setShowComponent('digitalZoom')"
                        :class="['btn', 'btn-default', {active: showComponent == 'digitalZoom' }]">
                    <span class="glyphicon glyphicon-zoom-in" aria-hidden="true"></span>
                </button>
                <button v-if="mustBeShown('project-explore-colormap')" @click="setShowComponent('colormap')"
                        :class="['btn', 'btn-default', {active: showComponent == 'colormap' }]">
                    <span class="glyphicon glyphicon-adjust" aria-hidden="true"></span>
                </button>
                <button @click="setShowComponent('annotationLayers')"
                        :class="['btn', 'btn-default', {active: showComponent == 'annotationLayers' }]">
                    Annotation layers
                </button>
                <button v-if="mustBeShown('project-explore-annotation-panel')"
                        @click="setShowComponent('annotationList')"
                        :class="['btn', 'btn-default', {active: showComponent == 'annotationList' }]">
                    <span class="glyphicon glyphicon-list" aria-hidden="true"></span>
                    Annotation list
                </button>
                <button v-if="imageGroups[0]" @click="setShowComponent('multidimension')"
                        :class="['btn', 'btn-default', {active: showComponent == 'multidimension' }]">
                    Multidimension
                </button>
                <button v-if="isReviewing" @click="setShowComponent('review')"
                        :class="['btn', 'btn-default', {active: showComponent == 'review' }]">
                    <span class="glyphicon glyphicon-check" aria-hidden="true"></span>
                    Review
                </button>
                <button v-if="mustBeShown('project-explore-property')" @click="setShowComponent('properties')"
                        :class="['btn', 'btn-default', {active: showComponent == 'properties' }]">
                    <span class="glyphicon glyphicon-tag" aria-hidden="true"></span>
                </button>
                <button v-if="this.maps.length > 1" class="btn btn-danger" @click="deleteMap">
                    <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                </button>
            </div>
            <div v-show="this.lastEventMapId == this.currentMap.id" class="scale-line-panel">
                <scale-line :currentMap="currentMap" :mousePosition="mousePosition"
                            :currentZoom="zoom" :maxZoom="maxZoom"></scale-line>
            </div>
        </div>
        <div v-show="(this.lastEventMapId == this.currentMap.id && showComponent != '')"
             class="panel component-panel component-panel-bottom"
             :style="`max-height:66%; ${showComponent == 'multidimension' ? 'width:33%;' :  ''}`">
            <div class="panel-body">
                <informations v-show="showComponent == 'informations'" @updateImsServer="setImsServer"
                              @changeImage="changeImage" :filterUrl="filterUrl"
                              :imsBaseUrl="imsBaseUrl" :currentMap="currentMap" :project="project"></informations>

                <div v-show="showComponent == 'linkmap' && mustBeShown('project-explore-link') && this.maps.length > 1">
                    <div class="alert alert-info">Choose a view to link with this one.</div>
                    <label :for="'link-'+currentMap.id">Link this view with </label>
                    <div v-for="(map, index) in maps" :key="'linkdiv' + map.id">
                        <template v-if="index !== mapIndex">
                            <input v-model="linkValue" :value="map.id" @change="sendLink(map.id)" type="checkbox"
                                   :name="currentMap.id + map.id" :id="currentMap.id + map.id">
                            <label :for="currentMap.id + map.id">{{ mapNames[index] }}
                                ({{instanceFilename(map.data)}})</label>
                        </template>
                    </div>
                </div>

                <digital-zoom v-show="showComponent == 'digitalZoom' && mustBeShown('project-explore-digital-zoom')"
                              :currentMap="currentMap"></digital-zoom>

                <div
                    v-show="showComponent == 'filter' && mustBeShown('project-explore-image-layers') && this.filters.length > 1">
                    <div class="alert alert-info">Choose a filter to apply</div>
                    <label :for="'original-filter-'+currentMap.id">Original</label>
                    <input v-model="filterSelected" type="radio" :name="'filter-original-'+currentMap.id"
                           :id="'filter-original-'+currentMap.id" value="">
                    <div v-for="filter in filters" :key="filter.id">
                        <label :for="'filter-'+filter.id+'-'+currentMap.id">{{filter.name}}</label>
                        <input v-model="filterSelected" type="radio" :name="'filter-'+filter.id+'-'+currentMap.id"
                               :id="'filter-'+filter.id+'-'+currentMap.id" :value="filter">
                    </div>
                </div>

                <color-maps v-show="showComponent == 'colormap' && mustBeShown('project-explore-colormap')"
                            :currentMap="currentMap"></color-maps>

                <div v-show="showComponent == 'annotationLayers'">
                    <annotation-layers @updateLayers="setUpdateLayers" @vectorLayersOpacity="setVectorLayersOpacity"
                                       @layersSelected="setLayersSelected" @userLayers="setUserLayers"
                                       @updateAnnotationsIndex="setUpdateAnnotationsIndex"
                                       :layerToAdd="addLayer" :onlineUsers="onlineUsers" :isReviewing="isReviewing"
                                       :updateLayers="updateLayers" :updateAnnotationsIndex="updateAnnotationsIndex"
                                       :termsToShow="termsToShow"
                                       :showWithNoTerm="showWithNoTerm" :allTerms="allTerms" :project="project"
                                       :currentMap="currentMap"></annotation-layers>
                    <ontology :currentMap="currentMap" :featureSelectedData="featureSelectedData"
                              :featureSelected="featureSelected" :vectorLayersOpacity="vectorLayersOpacity"
                              @showTerms="showTerms" @showWithNoTerm="setShowWithNoTerm"
                              @allTerms="setAllTerms"></ontology>
                </div>

                <annotations v-show="showComponent == 'annotationList'"
                             @updateAnnotationsIndex="setUpdateAnnotationsIndex"
                             :updateAnnotationsIndex="updateAnnotationsIndex" :isReviewing="isReviewing"
                             :users="userLayers" :terms="allTerms" :currentMap="currentMap"></annotations>

                <review v-if="isReviewing" v-show="showComponent == 'review'"
                        @updateAnnotationsIndex="setUpdateAnnotationsIndex" @updateLayers="setUpdateLayers"
                        @featureSelectedData="setFeatureSelectedData" @changeImage="changeImage"
                        :layersSelected="layersSelected" :currentMap="currentMap"
                        :featureSelectedData="featureSelectedData" :featureSelected="featureSelected"
                        :userLayers="userLayers"></review>

                <multidimension v-if="imageGroups[0]" v-show="showComponent == 'multidimension'"
                                @imageGroupHasChanged="setImageGroup" :imageGroups="imageGroups"
                                :filterUrl="filterUrl" :imsBaseUrl="imsBaseUrl" @changeImage="changeImage"
                                :currentMap="currentMap"></multidimension>

                <properties v-show="showComponent == 'properties'" :layersSelected="layersSelected"
                            :currentMap="currentMap"></properties>
            </div>
        </div>

        <annotation-details v-show="featureSelected != undefined" @featureSelectedData="setFeatureSelectedData"
                            :users="userLayers" :terms="allTerms"
                            :featureSelected="featureSelected" :currentMap="currentMap" :currentUser="currentUser"
                            :project="project" :element-height="elementHeight" :element-width="elementWidth">
        </annotation-details>
    </div>
</template>

<script>
    import AnnotationLayers from './Explore/AnnotationLayers'
    import Interactions from './Explore/Interactions';
    import Informations from './Explore/Informations';
    import Position from './Explore/Position';
    import Ontology from './Explore/Ontology';
    import AnnotationDetails from './Explore/AnnotationDetails';
    import Annotations from './Explore/Annotations';
    import Properties from './Explore/Properties';
    import Multidimension from './Explore/Multidimension';
    import DigitalZoom from './Explore/DigitalZoom'
    import Review from './Explore/Review'
    import ScaleLine from './Explore/ScaleLine'
    import ColorMaps from './Explore/Colormaps'
    import OverviewMap from './OverviewMap'

    import OlTile from 'ol/layer/tile';
    import Zoomify from 'ol/source/zoomify';
    import Group from 'ol/layer/group';
    import ZoomControls from 'ol/control/zoom';
    import RotateControls from 'ol/control/rotate';
    import WKT from 'ol/format/wkt';

    import mustBeShown from '../helpers/mustBeShown';

    export default {
        name: 'Explore',
        components: {
            AnnotationLayers,
            Interactions,
            Informations,
            Position,
            Ontology,
            AnnotationDetails,
            Annotations,
            Properties,
            Multidimension,
            DigitalZoom,
            Review,
            ScaleLine,
            ColorMaps,
            OverviewMap
        },
        data() {
            return {
                linkValue: [],
                mapNames: ['View 1', 'View 2', 'View 3', 'View 4'],
                imsBaseUrl: '',
                filterSelected: "",
                extent: [],
                mousePosition: [0, 0],
                termsToShow: [],
                showWithNoTerm: true,
                allTerms: [],
                featureSelected: undefined,
                featureSelectedData: {},
                userLayers: [],
                layersSelected: [],
                vectorLayersOpacity: 0.5,
                updateLayers: false,
                updateAnnotationsIndex: false,
                onlineUsers: [],
                showComponent: '',
                showPanel: true,
                addLayer: '',
                zoom: 0,
                maxZoom: 0,
                innerWidth: 0,
                innerHeight: 0,
            }
        },
        props: [
            'mapView',
            'maps',
            'currentMap',
            'lastEventMapId',
            'filters',
            'imageGroups',
            'currentRoute',
            'paddingTop',
            'project',
            'currentUser',
        ],
        computed: {
            linkedTo() {
                return this.currentMap.linkedTo;
            },
            mapIndex() {
                return this.maps.findIndex(map => map.id === this.currentMap.id);
            },
            filterUrl() {
                if (this.filterSelected !== "") {
                    return `${this.filterSelected.processingServer}${this.filterSelected.baseUrl}`;
                } else {
                    return "";
                }
            },
            mapWidth() {
                return parseInt(this.currentMap.data.width)
            },
            mapHeight() {
                return parseInt(this.currentMap.data.height)
            },
            initZoom() {
                let mapWidth = this.mapWidth;
                let mapHeight = this.mapHeight;
                let idealZoom = this.currentMap.data.depth;
                while (mapWidth > this.elementWidth || mapHeight > this.elementHeight) {
                    mapWidth /= 2;
                    mapHeight /= 2;
                    idealZoom--;
                }
                return idealZoom
            },
            isReviewing() {
                // DEPENDS ON [BACKBONE]
                let type = ''; //document.querySelector('.get-data' + this.currentMap.imageId).dataset.type;
                let from = type.indexOf('-');
                return type.substr(from + 1) == 'review';
            },
            getCurrentZoom() {
                return this.mapView.mapResolution;
            },
            fullHeight() {
                return this.innerHeight - this.paddingTop
            },
            elementHeight() {
                let fullHeight = this.innerHeight - (50 + 42 + 34);
                let heights = [
                    [fullHeight],
                    [fullHeight, fullHeight],
                    [fullHeight / 2, fullHeight / 2, fullHeight / 2],
                    [fullHeight / 2, fullHeight / 2, fullHeight / 2, fullHeight / 2],
                ];
                return heights[this.maps.length - 1][this.mapIndex]
            },
            elementHeightPercentage() {
                return this.elementHeight / this.fullHeight * 100;
            },
            elementWidth() {
                let fullWidth = this.innerWidth;
                let widths = [
                    [fullWidth],
                    [fullWidth / 2, fullWidth / 2],
                    [fullWidth / 2, fullWidth / 2, fullWidth],
                    [fullWidth / 2, fullWidth / 2, fullWidth / 2, fullWidth / 2],
                ];
                return widths[this.maps.length - 1][this.mapIndex]
            },
            elementWidthPercentage() {
                return this.elementWidth / this.innerWidth * 100;
            },
            centeredFeature() {
                let index = this.currentRoute.lastIndexOf('-');
                return this.currentRoute.substr(index + 1);
            },
        },
        watch: {
            mapView: {
                handler() {
                    let {mapCenter, mapResolution, mapRotation} = this.mapView;
                    let index = this.currentMap.linkedTo.findIndex(link => link == this.lastEventMapId);
                    if (index >= 0) {
                        this.$openlayers.getView(this.currentMap.id).setProperties({
                            center: mapCenter,
                            resolution: mapResolution,
                            rotation: mapRotation,
                        })
                    }
                },
                deep: true,
            },
            linkedTo() {
                // Sets the local value to the value sent by the parent
                this.linkValue = this.currentMap.linkedTo;
            },
            filterSelected() {
                //sets filter on change
                let layer = new OlTile({
                    source: new Zoomify({
                        url: `${this.filterUrl}${this.imsBaseUrl}&tileGroup={TileGroup}&z={z}&x={x}&y={y}&channels=0&layer=0&timeframe=0&mimeType=${this.currentMap.data.mime}`,
                        size: [this.mapWidth, this.mapHeight],
                        extent: this.extent,
                    }),
                    extent: this.extent,
                });
                this.$openlayers.getMap(this.currentMap.id).getLayers().getArray()[0] = layer;
                this.$openlayers.getMap(this.currentMap.id).render();
            },
            lastEventMapId() {
                this.showPanel = this.lastEventMapId == this.currentMap.id;
            },
            centeredFeature(newValue) {
                if (newValue != this.currentMap.data.project) {
                    this.centerOnFeature(newValue);
                }
            },
            elementWidth(newValue) {
                this.$openlayers.getMap(this.currentMap.id).setSize([newValue, this.elementHeight])
            },
            elementHeight(newValue) {
                this.$openlayers.getMap(this.currentMap.id).setSize([this.elementWidth, newValue])
            },
        },
        methods: {
            getWindowHeight(e) {
                this.innerHeight = window.innerHeight
            },
            getWindowWidth(e) {
                this.innerWidth = window.innerWidth
            },
            // Sends view infos
            sendView(e) {
                let payload = {
                    mapId: this.currentMap.id,
                    view: this.$openlayers.getView(this.currentMap.id),
                };
                let rect = this.$refs.exploreMap.getBoundingClientRect();
                this.mousePosition = [
                    e.clientX - rect.left,
                    e.clientY - rect.top
                ];
                this.$emit('dragged', payload);
            },
            // Sends which map is linked to this one to the parent
            sendLink(mapId) {
                let payload = {
                    sender: this.currentMap.id,
                    newLinks: this.linkValue,
                    modifiedValue: mapId,
                };
                this.$emit('mapIsLinked', payload);
            },
            postPosition() {
                let extent = this.$openlayers.getView(this.currentMap.id).calculateExtent();
                let payload = {
                    bottomLeftX: Math.round(extent[0]),
                    bottomLeftY: Math.round(extent[1]),
                    bottomRightX: Math.round(extent[2]),
                    bottomLeftY: Math.round(extent[1]),
                    image: parseInt(this.currentMap.imageId),
                    topLeftX: Math.round(extent[0]),
                    topLeftY: Math.round(extent[3]),
                    topRightX: Math.round(extent[2]),
                    topRightY: Math.round(extent[3]),
                    zoom: this.$openlayers.getView(this.currentMap.id).getZoom(),
                };
                api.post(`/api/imageinstance/${this.currentMap.imageId}/position.json`, payload);
            },
            getOnlineUsers() {
                api.get(`/api/project/${this.currentMap.data.project}/online/user.json`).then(data => {
                    this.onlineUsers = data.data.collection;
                })
            },
            centerOnFeature(id) {
                if (id == 0 || id == '') {
                    return;
                }
                api.get(`/api/annotation/${id}.json`).then(data => {
                    let annotation = data.data;
                    let format = new WKT();
                    let feature = format.readFeature(annotation.location);
                    let annotLayer = this.$openlayers.getMap(this.currentMap.id).getLayers().getArray().findIndex(layer => layer.get('title') == annotation.user);
                    if (annotLayer < 0) {
                        this.addLayer = annotation.user;
                    }
                    this.$openlayers.getView(this.currentMap.id).fit(feature.getGeometry());
                })
            },
            deleteMap() {
                this.$emit('deleteMap', this.currentMap.id);
            },
            showTerms(payload) {
                this.termsToShow = payload;
            },
            setShowWithNoTerm(payload) {
                this.showWithNoTerm = payload;
            },
            setAllTerms(payload) {
                this.allTerms = payload;
            },
            setFeatureSelected(payload) {
                this.featureSelected = payload;
            },
            setUserLayers(payload) {
                this.userLayers = payload;
            },
            setLayersSelected(payload) {
                this.layersSelected = payload;
            },
            changeImage(payload) {
                api.get(`/api/abstractimage/${payload.baseImage}/imageservers.json?&imageinstance=${payload.id}`).then(data => {
                    this.imsBaseUrl = data.data.imageServersURLs[0];

                    let reset = this.currentMap.data.width != payload.width || this.currentMap.data.height != payload.height;
                    this.$emit('updateMap', {old: this.currentMap, new: payload});

                    this.extent = [0, 0, this.mapWidth, this.mapHeight];
                    if (reset) {
                        this.$openlayers.getView(this.currentMap.id).setCenter([this.mapWidth / 2, this.mapHeight / 2]);
                        this.$openlayers.getView(this.currentMap.id).setZoom(this.initZoom);
                        this.$openlayers.getView(this.currentMap.id).getProjection().setExtent(this.extent);
                        this.zoom = this.$openlayers.getView(this.currentMap.id).getZoom();
                    }

                    let layer = new OlTile({
                        source: new Zoomify({
                            url: `${this.filterUrl}${this.imsBaseUrl}&tileGroup={TileGroup}&z={z}&x={x}&y={y}&channels=0&layer=0&timeframe=0&mimeType=${this.currentMap.data.mime}`,
                            size: [this.mapWidth, this.mapHeight],
                            extent: this.extent,
                        }),
                        extent: this.extent,
                    });

                    // Find a way to avoid "blank flashes" when image change at least for multidimensional images.
                    // let oldLayers = this.$openlayers.getMap(this.currentMap.id).getLayers().getArray();
                    // this.$openlayers.getMap(this.currentMap.id).addLayer(layer);
                    // oldLayers.forEach(layer => this.$openlayers.getMap(this.currentMap.id).removeLayer(layer));
                    this.$openlayers.getMap(this.currentMap.id).setLayerGroup(new Group({layers: [layer]}));

                    this.$openlayers.getView(this.currentMap.id).setMaxZoom(this.currentMap.data.depth);
                    this.maxZoom = this.$openlayers.getView(this.currentMap.id).getMaxZoom();

                    this.setUpdateLayers(true);
                    this.setUpdateAnnotationsIndex(true);
                    this.setFeatureSelected(undefined);
                });
            },
            setVectorLayersOpacity(payload) {
                this.vectorLayersOpacity = payload;
            },
            setImageGroup(payload) {
                this.currentMap.imageGroup = payload;
            },
            setFeatureSelectedData(payload) {
                this.featureSelectedData = payload;
            },
            setUpdateLayers(payload) {
                this.updateLayers = payload;
            },
            setUpdateAnnotationsIndex(payload) {
                this.updateAnnotationsIndex = payload;
            },
            setShowComponent(component) {
                if (component == this.showComponent) {
                    this.showComponent = '';
                } else {
                    this.showComponent = component;
                }
            },
            setImsServer(payload) {
                this.imsBaseUrl = payload;
            },
            mustBeShown(key) {
                return mustBeShown(key, this.currentMap.projectConfig);
            },
            instanceFilename(image) {
                if (this.project.blindMode)
                    return `[BLIND] ${image.id}`;
                return image.instanceFilename
            },
        },
        created() {
            this.getWindowWidth();
            this.getWindowHeight();
        },
        mounted() {
            this.$nextTick(function() {
                window.addEventListener('resize', this.getWindowHeight);
                window.addEventListener('resize', this.getWindowWidth);
            });

            this.extent = [0, 0, this.mapWidth, this.mapHeight];

            // Init map
            this.$openlayers.init({
                element: this.currentMap.id,
                center: [this.mapWidth / 2, this.mapHeight / 2],
                zoom: this.initZoom,
                controls: [
                    new ZoomControls({
                        target: document.getElementById('controls-' + this.currentMap.id),
                    }),
                    new RotateControls({
                        target: document.getElementById('controls-' + this.currentMap.id),
                    })
                ],
                enablePan: true,
                enableMouseWheelZoom: true,
                enableDoubleClickZoom: true,
                minZoom: 0,
                projection: {
                    code: 'CYTO',
                    extent: this.extent,
                },
            });
            api.get(`/api/abstractimage/${this.currentMap.data.baseImage}/imageservers.json`).then(data => {
                this.imsBaseUrl = data.data.imageServersURLs[0];
                // Adds layer
                let layer = new OlTile({
                    source: new Zoomify({
                        url: `${this.filterUrl}${this.imsBaseUrl}&tileGroup={TileGroup}&z={z}&x={x}&y={y}&channels=0&layer=0&timeframe=0&mimeType=${this.currentMap.data.mime}`,
                        size: [this.mapWidth, this.mapHeight],
                        extent: this.extent,
                    }),
                    extent: this.extent,
                });
                this.$openlayers.getMap(this.currentMap.id).addLayer(layer);
                this.$openlayers.getView(this.currentMap.id).setMaxZoom(this.currentMap.data.depth);
                this.$openlayers.getMap(this.currentMap.id).on('moveend', () => {
                    this.zoom = this.$openlayers.getView(this.currentMap.id).getZoom();
                    this.maxZoom = this.$openlayers.getView(this.currentMap.id).getMaxZoom();
                });
                this.$openlayers.getMap(this.currentMap.id).on('moveend', () => {
                    this.postPosition();
                });
                this.$openlayers.getMap(this.currentMap.id).getControls().getArray()[0].element.childNodes.forEach(child => {
                    child.classList.add('btn');
                    child.classList.add('btn-default');
                });
                this.$openlayers.getMap(this.currentMap.id).getControls().getArray()[1].element.childNodes.forEach(child => {
                    child.classList.add('btn');
                    child.classList.add('btn-default');
                });
                setInterval(this.postPosition, 5000);
                setInterval(this.getOnlineUsers, 5000);
                if (this.isReviewing) {
                    api.put(`/api/imageinstance/${this.currentMap.imageId}/review.json`, {
                        id: this.currentMap.imageId,
                    }).then(data => {
                        this.changeImage(data.data.imageinstance)
                    })
                }
                if (this.centeredFeature != '' && this.centeredFeature != this.currentMap.data.project) {
                    this.centerOnFeature(this.centeredFeature);
                }
            });
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.getWindowHeight);
            window.removeEventListener('resize', this.getWindowWidth);
        }
    }

</script>

<style scoped>
    .controls {
        position: absolute;
        top: 1em;
        left: 1em;
        display: flex;
        flex-direction: column;
    }
</style>

<style>
    .map {
        position: relative;
        overflow: hidden;
    }

    .ol-zoom {
        margin-bottom: 1em;
        display: flex;
        flex-direction: column;
    }

    .ol-zoom-in {
        margin-bottom: 1em;
    }

    .bottom-panel {
        display: flex;
        position: absolute;
        bottom: 1em;
        left: 1em;
        z-index: 2000;
    }

    .component-panel {
        border: 1px solid rgb(240, 240, 240);
        overflow-y: auto;
        position: absolute;
    }

    .component-panel-bottom {
        bottom: 4em;
        left: 1em;
        margin-right: 1em;
    }
</style>
