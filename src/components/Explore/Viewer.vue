<template>
    <div :style="`height:${elementHeightPercentage}%;width:${elementWidthPercentage}%;`" class="map">
        <div  @mousemove="sendView" @mousewheel="sendView" :id="id" ref="exploreMap"></div>
        <div class="controls" :id="'controls-'+id"></div>

        <interactions v-show="isCurrentViewer" @updateLayers="setUpdateLayers"
                      @featureSelected="setFeatureSelected" :currentMap="currentMap" :isReviewing="isReviewing"
                      @updateAnnotationsIndex="setUpdateAnnotationsIndex" :vectorLayersOpacity="vectorLayersOpacity"
                      :currentUser="currentUser" :project="project">
        </interactions>

        <overview-map :viewer-id="id" :image="image" :elementHeight="elementHeight" :elementWidth="elementWidth"></overview-map>
        <div v-show="isCurrentViewer">
            <viewer-buttons :selected-component.sync="selectedComponent" @deleteViewer="deleteViewer"
                            :has-multi-views="hasMultiViews" :is-reviewing="isReviewing" :has-filters="hasFilters"
                            :has-image-groups="hasImageGroups" :project-config="projectConfig"></viewer-buttons>

            <div class="scale-line-panel">
                <scale-line :viewer-id="id" :image="image" :mousePosition="mousePosition"
                            :currentZoom="zoom" :maxZoom="maxZoom"></scale-line>
            </div>
        </div>
        <div v-show="(isCurrentViewer && selectedComponent != '')"
             class="panel component-panel component-panel-bottom"
             :style="`max-height:66%; ${selectedComponent == 'multidimension' ? 'width:33%;' :  ''}`">
            <div class="panel-body">
                <div v-show="selectedComponent == 'informations'">
                    <informations :image="image" :project="project"></informations>
                    <hr>
                    <navigation-image :current-image-id="imageId" @changeImage=""></navigation-image>
                </div>

                <div v-show="selectedComponent == 'linkmap' && mustBeShown('project-explore-link') && hasMultiViews">
                    <div class="alert alert-info">Choose a view to link with this one.</div>
                    <label>Link this view with </label>
                    <div v-for="(viewer, index) in viewers" :key="'link-div-' + viewer.id">
                        <template v-if="index !== viewerIndex">
                            <input v-model="linkedToValues" :value="viewer.id" @change="linkViewers(viewer.id)" type="checkbox"
                                   :name="id + viewer.id" :id="id + viewer.id">
                            <label :for="id + viewer.id">
                                {{ viewerNames[index] }}
                                <span v-if="!project.blindMode">({{viewer.image.instanceFilename}})</span>
                                <span v-else>([BLIND] {{viewer.image.id}})</span>
                            </label>
                        </template>
                    </div>
                </div>

                <digital-zoom v-show="selectedComponent == 'digitalZoom' && mustBeShown('project-explore-digital-zoom')"
                              :viewer-id="id" @incrementMaxZoom=""></digital-zoom>

                <filters v-show="selectedComponent == 'filter' && mustBeShown('project-explore-image-layers') && hasFilters"
                         :viewer-id="id" :filters="filters" :selectedFilter.sync="selectedFilter">
                </filters>

                <color-maps v-show="selectedComponent == 'colormap' && mustBeShown('project-explore-colormap')"
                            :viewer-id="id"></color-maps>

                <div v-show="selectedComponent == 'annotationLayers'">
                    <annotation-layers @updateLayers="setUpdateLayers" @vectorLayersOpacity="setVectorLayersOpacity"
                                       @layersSelected="setLayersSelected" @userLayers="setUserLayers"
                                       @updateAnnotationsIndex="setUpdateAnnotationsIndex"
                                       :layerToAdd="addLayer" :onlineUsers="onlineUsers" :isReviewing="isReviewing"
                                       :updateLayers="updateLayers" :updateAnnotationsIndex="updateAnnotationsIndex"
                                       :termsToShow="termsToShow" :currentUser="currentUser"
                                       :showWithNoTerm="showWithNoTerm" :allTerms="allTerms" :project="project"
                                       :image="image" :viewer-id="id"></annotation-layers>
                    <ontology :image="image" :featureSelectedData="featureSelectedData"
                              :featureSelected="featureSelected" :vectorLayersOpacity="vectorLayersOpacity"
                              @showTerms="showTerms" @showWithNoTerm="setShowWithNoTerm"
                              @allTerms="setAllTerms"></ontology>
                </div>

                <annotations v-show="selectedComponent == 'annotationList'"
                             @updateAnnotationsIndex="setUpdateAnnotationsIndex"
                             :updateAnnotationsIndex="updateAnnotationsIndex" :isReviewing="isReviewing"
                             :users="userLayers" :terms="allTerms" :image="image"></annotations>

                <review v-if="isReviewing" v-show="selectedComponent == 'review'"
                        @updateAnnotationsIndex="setUpdateAnnotationsIndex" @updateLayers="setUpdateLayers"
                        @featureSelectedData="setFeatureSelectedData" @changeImage="changeImage"
                        :layersSelected="layersSelected" :currentMap="currentMap"
                        :featureSelectedData="featureSelectedData" :featureSelected="featureSelected"
                        :userLayers="userLayers"></review>

                <multidimension v-if="imageGroups[0]" v-show="selectedComponent == 'multidimension'"
                                @imageGroupHasChanged="setImageGroup" :imageGroups="imageGroups"
                                :filterUrl="filterUrl" :imsBaseUrl="imsBaseUrl" @changeImage="changeImage"
                                :currentMap="currentMap"  :mousePosition="mousePosition"></multidimension>

                <properties v-show="selectedComponent == 'properties'" :layersSelected="layersSelected"
                            :viewer-id="id" :image="image"></properties>
            </div>
        </div>

        <annotation-details v-show="featureSelected != undefined" @featureSelectedData="setFeatureSelectedData"
                            :users="userLayers" :terms="allTerms"
                            :featureSelected="featureSelected" :project-config="projectConfig" :currentUser="currentUser"
                            :project="project" :element-height="elementHeight" :element-width="elementWidth">
        </annotation-details>
    </div>
</template>

<script>
    import AnnotationLayers from './AnnotationLayers'
    import Interactions from './Interactions';
    import Informations from './Panels/Informations';
    import Position from './Position';
    import Ontology from './Ontology';
    import AnnotationDetails from './AnnotationDetails';
    import Annotations from './Annotations';
    import Properties from './Properties';
    import Multidimension from './Multidimension';
    import DigitalZoom from './Panels/DigitalZoom'
    import Review from './Review'
    import ScaleLine from './ScaleLine'
    import ColorMaps from './Colormaps'
    import OverviewMap from './OverviewMap'

    import OlTile from 'ol/layer/tile';
    import Zoomify from 'ol/source/zoomify';
    import Group from 'ol/layer/group';
    import ZoomControls from 'ol/control/zoom';
    import RotateControls from 'ol/control/rotate';
    import WKT from 'ol/format/wkt';
    import ViewerButtons from "./ViewerButtons";

    import mustBeShown from '../../helpers/mustBeShown';
    import Filters from "./Panels/Filters";
    import NavigationImage from "./Panels/NavigationImage";


    export default {
        name: 'Viewer',
        components: {
            NavigationImage,
            Filters,
            ViewerButtons,
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
                viewerNames: ['View 1', 'View 2', 'View 3', 'View 4'],
                selectedComponent: '',
                selectedFilter: "",
                linkedToValues: [],

                imsBaseUrl: '',
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

                showPanel: true,
                addLayer: '',
                zoom: 0,
                maxZoom: 0,
                innerWidth: 0,
                innerHeight: 0,
            }
        },
        props: [
            'currentRoute',
            'project',
            'projectConfig',
            'filters',
            'imageGroups',
            'currentUser',
            'viewers',
            'paddingTop',

            'id',
            'imageId',
            'linkedTo',
            'image',

            'mapView',
            'currentMap',
            'lastEventMapId',
        ],
        computed: {
            isCurrentViewer() {
                return this.lastEventMapId == this.id;
            },
            hasFilters() {
                return this.filters.length > 0
            },
            hasImageGroups() {
                return this.imageGroups.length > 0
            },
            hasMultiViews() {
                return this.viewers.length > 1
            },
            filterUrl() {
                if (!this.selectedFilter)
                    return "";
                return `${this.selectedFilter.imagingServer}${this.selectedFilter.baseUrl}`;
            },
            viewerIndex() {
                return this.viewers.findIndex(map => map.id === this.id);
            },



            mapWidth() {
                return parseInt(this.image.width)
            },
            mapHeight() {
                return parseInt(this.image.height)
            },
            initZoom() {
                let mapWidth = this.mapWidth;
                let mapHeight = this.mapHeight;
                let idealZoom = this.image.depth;
                while (mapWidth > this.elementWidth || mapHeight > this.elementHeight) {
                    mapWidth /= 2;
                    mapHeight /= 2;
                    idealZoom--;
                }
                return idealZoom
            },
            isReviewing() {
                // DEPENDS ON [BACKBONE]
                let type = ''; //document.querySelector('.get-data' + this.imageId).dataset.type;
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
                let fullHeight = this.innerHeight - this.paddingTop;
                let heights = [
                    [fullHeight],
                    [fullHeight, fullHeight],
                    [fullHeight / 2, fullHeight / 2, fullHeight / 2],
                    [fullHeight / 2, fullHeight / 2, fullHeight / 2, fullHeight / 2],
                ];
                return heights[this.viewers.length - 1][this.viewerIndex]
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
                return widths[this.viewers.length - 1][this.viewerIndex]
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
                    let index = this.linkedTo.findIndex(link => link == this.lastEventMapId);
                    if (index >= 0) {
                        this.$openlayers.getView(this.id).setProperties({
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
                this.linkedToValues = this.linkedTo;
            },
            selectedFilter() {
                //sets filter on change
                let layer = new OlTile({
                    source: new Zoomify({
                        url: `${this.filterUrl}${this.imsBaseUrl}&tileGroup={TileGroup}&z={z}&x={x}&y={y}&channels=0&layer=0&timeframe=0&mimeType=${this.image.mime}`,
                        size: [this.mapWidth, this.mapHeight],
                        extent: this.extent,
                    }),
                    extent: this.extent,
                });
                this.$openlayers.getMap(this.id).getLayers().getArray()[0] = layer;
                this.$openlayers.getMap(this.id).render();
            },
            centeredFeature(newValue) {
                if (newValue != this.image.project) {
                    this.centerOnFeature(newValue);
                }
            },
            elementWidth(newValue) {
                this.$openlayers.getMap(this.id).setSize([newValue, this.elementHeight])
            },
            elementHeight(newValue) {
                this.$openlayers.getMap(this.id).setSize([this.elementWidth, newValue])
            },
        },
        methods: {
            deleteViewer() {
                this.$emit('deleteViewer', this.id);
            },
            linkViewers(mapId) {
                let payload = {
                    sender: this.id,
                    newLinks: this.linkedToValues,
                    modifiedValue: mapId,
                };
                this.$emit('linkViewers', payload);
            },



            getWindowHeight(e) {
                this.innerHeight = window.innerHeight
            },
            getWindowWidth(e) {
                this.innerWidth = window.innerWidth
            },
            // Sends view infos
            sendView(e) {
                let payload = {
                    mapId: this.id,
                    view: this.$openlayers.getView(this.id),
                };
                let rect = this.$refs.exploreMap.getBoundingClientRect();
                this.mousePosition = [
                    e.clientX - rect.left,
                    e.clientY - rect.top
                ];
                this.$emit('dragged', payload);
            },
            postPosition() {
                let extent = this.$openlayers.getView(this.id).calculateExtent();
                let payload = {
                    bottomLeftX: Math.round(extent[0]),
                    bottomLeftY: Math.round(extent[1]),
                    bottomRightX: Math.round(extent[2]),
                    bottomLeftY: Math.round(extent[1]),
                    image: parseInt(this.imageId),
                    topLeftX: Math.round(extent[0]),
                    topLeftY: Math.round(extent[3]),
                    topRightX: Math.round(extent[2]),
                    topRightY: Math.round(extent[3]),
                    zoom: this.$openlayers.getView(this.id).getZoom(),
                };
                api.post(`/api/imageinstance/${this.imageId}/position.json`, payload);
            },
            getOnlineUsers() {
                api.get(`/api/project/${this.image.project}/online/user.json`).then(response => {
                    this.onlineUsers = response.data.collection;
                })
            },
            centerOnFeature(id) {
                if (id == 0 || id == '') {
                    return;
                }
                api.get(`/api/annotation/${id}.json`).then(response => {
                    let annotation = response.data;
                    let format = new WKT();
                    let feature = format.readFeature(annotation.location);
                    let annotLayer = this.$openlayers.getMap(this.id).getLayers().getArray().findIndex(layer => layer.get('title') == annotation.user);
                    if (annotLayer < 0) {
                        this.addLayer = annotation.user;
                    }
                    this.$openlayers.getView(this.id).fit(feature.getGeometry());
                })
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
                api.get(`/api/abstractimage/${payload.baseImage}/imageservers.json?&imageinstance=${payload.id}`).then(response => {
                    this.imsBaseUrl = response.data.imageServersURLs[0];

                    let reset = this.image.width != payload.width || this.image.height != payload.height;
                    this.$emit('updateMap', {old: this.currentMap, new: payload});

                    this.extent = [0, 0, this.mapWidth, this.mapHeight];
                    if (reset) {
                        this.$openlayers.getView(this.id).setCenter([this.mapWidth / 2, this.mapHeight / 2]);
                        this.$openlayers.getView(this.id).setZoom(this.initZoom);
                        this.$openlayers.getView(this.id).getProjection().setExtent(this.extent);
                        this.zoom = this.$openlayers.getView(this.id).getZoom();
                    }

                    let layer = new OlTile({
                        source: new Zoomify({
                            url: `${this.filterUrl}${this.imsBaseUrl}&tileGroup={TileGroup}&z={z}&x={x}&y={y}&channels=0&layer=0&timeframe=0&mimeType=${this.image.mime}`,
                            size: [this.mapWidth, this.mapHeight],
                            extent: this.extent,
                        }),
                        extent: this.extent,
                    });

                    // Find a way to avoid "blank flashes" when image change at least for multidimensional images.
                    // let oldLayers = this.$openlayers.getMap(this.id).getLayers().getArray();
                    // this.$openlayers.getMap(this.id).addLayer(layer);
                    // oldLayers.forEach(layer => this.$openlayers.getMap(this.id).removeLayer(layer));
                    this.$openlayers.getMap(this.id).setLayerGroup(new Group({layers: [layer]}));

                    this.$openlayers.getView(this.id).setMaxZoom(this.image.depth);
                    this.maxZoom = this.$openlayers.getView(this.id).getMaxZoom();

                    this.setUpdateLayers(true);
                    this.setUpdateAnnotationsIndex(true);
                    this.setFeatureSelected(undefined);
                });
            },
            setVectorLayersOpacity(payload) {
                this.vectorLayersOpacity = payload;
            },
            setImageGroup(payload) {
                this.imageGroup = payload;
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
            setSelectedComponent(component) {
                if (component == this.selectedComponent) {
                    this.selectedComponent = '';
                } else {
                    this.selectedComponent = component;
                }
            },
            setImsServer(payload) {
                this.imsBaseUrl = payload;
            },
            mustBeShown(key) {
                return mustBeShown(key, this.projectConfig);
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
                element: this.id,
                center: [this.mapWidth / 2, this.mapHeight / 2],
                zoom: this.initZoom,
                controls: [
                    new ZoomControls({
                        target: document.getElementById('controls-' + this.id),
                    }),
                    new RotateControls({
                        target: document.getElementById('controls-' + this.id),
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
            api.get(`/api/abstractimage/${this.image.baseImage}/imageservers.json`).then(response => {
                this.imsBaseUrl = response.data.imageServersURLs[0];
                // Adds layer
                let layer = new OlTile({
                    source: new Zoomify({
                        url: `${this.filterUrl}${this.imsBaseUrl}&tileGroup={TileGroup}&z={z}&x={x}&y={y}&channels=0&layer=0&timeframe=0&mimeType=${this.image.mime}`,
                        size: [this.mapWidth, this.mapHeight],
                        extent: this.extent,
                    }),
                    extent: this.extent,
                });
                this.$openlayers.getMap(this.id).addLayer(layer);
                this.$openlayers.getView(this.id).setMaxZoom(this.image.depth);
                this.$openlayers.getMap(this.id).on('moveend', () => {
                    this.zoom = this.$openlayers.getView(this.id).getZoom();
                    this.maxZoom = this.$openlayers.getView(this.id).getMaxZoom();
                });
                this.$openlayers.getMap(this.id).on('moveend', () => {
                    this.postPosition();
                });
                this.$openlayers.getMap(this.id).getControls().getArray()[0].element.childNodes.forEach(child => {
                    child.classList.add('btn');
                    child.classList.add('btn-default');
                });
                this.$openlayers.getMap(this.id).getControls().getArray()[1].element.childNodes.forEach(child => {
                    child.classList.add('btn');
                    child.classList.add('btn-default');
                });
                setInterval(this.postPosition, 5000);
                setInterval(this.getOnlineUsers, 5000);
                if (this.isReviewing) {
                    api.put(`/api/imageinstance/${this.imageId}/review.json`, {
                        id: this.imageId,
                    }).then(response => {
                        this.changeImage(response.data.imageinstance)
                    })
                }
                if (this.centeredFeature != '' && this.centeredFeature != this.image.project) {
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
