<template>
    <div :style="`height:${elementHeightPercentage}%;width:${elementWidthPercentage}%;`" class="map">
        <!--<div  @mousemove="sendView" @mousewheel="sendView" :id="id" ref="exploreMap">-->
        <div>
            <vl-map ref="map" :load-tiles-while-animating="true" :load-tiles-while-interacting="true"
                    @singleclick="clickCoordinate = $event.coordinate" data-projection="CYTO:FLAT">

                <vl-view :center.sync="center" :zoom.sync="zoom" :extent="extent" :max-zoom="maxZoom"
                         :rotation.sync="rotation" projection="CYTO:FLAT"></vl-view>

                <vl-layer-tile :extent="extent">
                    <vl-source-zoomify :url="baseLayerUrl()" :size="imageSize" projection="CYTO:FLAT"
                                       :extent="extent" :key="baseLayerUrl()"></vl-source-zoomify>
                </vl-layer-tile>
            </vl-map>
        </div>
        <!--<div class="controls" :id="'controls-'+id"></div>-->

        <!--<interactions v-show="isCurrentViewer" @updateLayers="setUpdateLayers"-->
        <!--@featureSelected="setFeatureSelected" :currentMap="currentMap" :isReviewing="isReviewing"-->
        <!--@updateAnnotationsIndex="setUpdateAnnotationsIndex" :vectorLayersOpacity="vectorLayersOpacity"-->
        <!--:currentUser="currentUser" :project="project">-->
        <!--</interactions>-->

        <!--<overview-map :viewer-id="id" :image="image" :elementHeight="elementHeight" :elementWidth="elementWidth"></overview-map>-->
        <div v-show="isCurrentViewer">
            <viewer-buttons :selected-component.sync="selectedComponent" @deleteViewer="deleteViewer"
                            :has-multi-views="hasMultiViews" :is-reviewing="isReviewing" :has-filters="hasFilters"
                            :has-image-sequences="hasImageSequences"
                            :has-annotation-properties="hasAnnotationProperties"
                            :project-config="projectConfig" :has-online-users="hasOnlineUsers"
                            :review-mode="reviewMode"></viewer-buttons>

            <div class="scale-line-panel">
                <!--<scale-line :viewer-id="id" :image="image" :mousePosition="mousePosition"-->
                <!--:currentZoom="zoom" :maxZoom="maxZoom"></scale-line>-->
            </div>
        </div>
        <div v-show="(isCurrentViewer && selectedComponent != '')"
             class="panel component-panel component-panel-bottom"
             :style="`max-height:75%; ${selectedComponent == 'multidimension' ? 'width:33%;' :  ''}
             ${selectedComponent == 'review' ? 'width:25%;' :  ''}`">
            <div class="panel-body">
                <div v-show="selectedComponent == 'informations'">
                    <informations :image="image" :project="project"></informations>
                    <hr>
                    <navigation-image :current-image-id="image.id" @changeImage="changeImage"></navigation-image>
                </div>

                <div v-show="selectedComponent == 'linkmap' && mustBeShown('project-explore-link') && hasMultiViews">
                    <h4><i class="fas fa-link"></i> Link viewers</h4>
                    <div class="alert alert-info">Choose a view to link with this one.</div>
                    <label>Link this view with </label>
                    <div v-for="(viewer, index) in viewers" :key="'link-div-' + viewer.id">
                        <template v-if="index !== viewerIndex">
                            <input v-model="linkedToValues" :value="viewer.id" @change="linkViewers(viewer.id)"
                                   type="checkbox" :name="id + viewer.id" :id="id + viewer.id">
                            <label :for="id + viewer.id">
                                {{ viewerNames[index] }}
                                <span v-if="!project.blindMode">({{viewer.image.instanceFilename}})</span>
                                <span v-else>([BLIND] {{viewer.image.id}})</span>
                            </label>
                        </template>
                    </div>
                </div>

                <digital-zoom v-show="selectedComponent == 'digitalZoom' && mustBeShown('project-explore-digital-zoom')"
                              :viewer-id="id" @incrementMaxZoom="incrementMaxZoom"></digital-zoom>

                <filters
                    v-show="selectedComponent == 'filter' && mustBeShown('project-explore-image-layers') && hasFilters"
                    :viewer-id="id" :filters="filters" :selectedFilter.sync="selectedFilter">
                </filters>

                <color-maps v-show="selectedComponent == 'colormap' && mustBeShown('project-explore-colormap')"
                            :viewer-id="id"></color-maps>


                <annotation-layers v-show="selectedComponent == 'annotationLayers'"
                                   @updateLayer="updateLayer" :isReviewing="isReviewing" :project="project"
                                   :user-layers="userLayers" :viewer-id="id" :current-user="currentUser"
                                   :show-review="reviewMode || image.reviewed">
                </annotation-layers>

                <ontology v-show="selectedComponent == 'ontology'" :project="project" :ontology="ontology"
                          :visible-terms="visibleTerms" :associable-terms="associableTerms" :size-terms="sizeTerms"
                          :visible-no-term="visibleNoTerm" @toggleAssociateTerm="toggleAssociateTerm"
                          @toggleVisibilityTerm="toggleVisibilityTerm" @showAllTerms="showAllTerms"></ontology>

                <annotations v-show="selectedComponent == 'annotationList'" :isReviewing="isReviewing"
                             :users="userLayers" :terms="allTerms" :image="image" :visible-term-ids="visibleTerms"
                             :visible-user-ids="visibleUserLayerIds" :size-terms="sizeTerms"></annotations>

                <review v-show="selectedComponent == 'review'" @changeReviewStatus="changeReviewStatus"
                        :image="image" :current-user="currentUser" :review-user="userById(image.reviewUser)"
                        :review-mode.sync="reviewMode" :nb-visible-annotations="0"></review>

                <multidimension v-show="selectedComponent == 'multidimension' && hasImageSequences"
                                :image-groups="imageGroups" :image-sequences="imageSequences"
                                :selected-sequence.sync="selectedSequence" :viewer-id="id"
                                @changeSequence="changeSequence"></multidimension>

                <properties v-show="selectedComponent == 'properties' && mustBeShown('project-explore-property')
                                    && hasAnnotationProperties" :properties="availableAnnotationProperties"></properties>

                <div v-show="selectedComponent == 'follow' && mustBeShown('project-explore-follow') && hasOnlineUsers">
                    <h4>
                        <i class="fas fa-chess-rook"></i> Follow online users
                    </h4>
                    <div class="alert alert-info">Choose a user to follow</div>

                    <div class="radio">
                        <input v-model="followedUser" type="radio" :name="'follow-no-' + id"
                               :id="'follow-no-' + id" value="">
                        <label :for="'follow-no-' + id">No tracking</label>
                    </div>
                    <template v-if="onlineAdmins.length > 0">
                        <h4>Managers</h4>
                        <div class="radio">

                            <div v-for="user in onlineAdmins" :key="user.id">
                                <input v-model="followedUser" type="radio" :name="'follow-'+user.id+'-' + id"
                                       :id="'follow-'+user.id+'-' + id" :value="user">
                                <label :for="'follow-'+user.id+'-' + id">
                                    <username :user="userById(user.id)"></username>
                                </label>
                            </div>
                        </div>
                    </template>
                    <template v-if="onlineContributors.length > 0">
                        <h4>Contributors</h4>
                        <div class="radio">
                            <div v-for="user in onlineContributors" :key="user.id">
                                <input v-model="followedUser" type="radio" :name="'follow-'+user.id+'-' + id"
                                       :id="'follow-'+user.id+'-' + id" :value="user">
                                <label :for="'follow-'+user.id+'-' + id">
                                    <username :user="userById(user.id)"></username>
                                </label>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>

        <!--<annotation-details v-show="featureSelected != undefined" @featureSelectedData="setFeatureSelectedData"-->
        <!--:users="userLayers" :terms="allTerms"-->
        <!--:featureSelected="featureSelected" :project-config="projectConfig" :currentUser="currentUser"-->
        <!--:project="project" :element-height="elementHeight" :element-width="elementWidth">-->
        <!--</annotation-details>-->
    </div>
</template>

<script>
    import AnnotationLayers from './Panels/AnnotationLayers'
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

    import ViewerButtons from "./ViewerButtons";

    import mustBeShown from '../../helpers/mustBeShown';
    import Filters from "./Panels/Filters";
    import NavigationImage from "./Panels/NavigationImage";
    import clone from "lodash.clone"
    import differenceBy from "lodash.differenceby"
    import sample from "lodash.sample";
    import Username from "../User/Username";
    import {addProj, createProj} from "vuelayers/lib/_esm/ol-ext";

    export default {
        name: 'Viewer',
        components: {
            Username,
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
                followedUser: "",
                selectedSequence: {},
                linkedToValues: [],
                reviewMode: false,

                userLayers: [],
                visibleTerms: [],
                associableTerms: [],
                sizeTerms: {},
                visibleNoTerm: false,
                allTerms: [],
                annotationProperties: [],
                onlineUsers: [],
                imageSequences: [],
                imsServers: [],

                center: [0, 0],
                zoom: 0,
                maxZoom: 0,
                rotation: 0,
                clickCoordinate: undefined,
                selectedFeatures: [],

                imsBaseUrl: '',
                mousePosition: [0, 0],
                termsToShow: [],
                showWithNoTerm: true,
                featureSelected: undefined,
                featureSelectedData: {},
                layersSelected: [],
                vectorLayersOpacity: 0.5,
                updateLayers: false,
                updateAnnotationsIndex: false,
                showPanel: true,
                addLayer: '',
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
            'ontology',

            'id',
            'linkedTo',
            'image',

            'mapView',
            'currentMap',
            'lastEventMapId',
        ],
        computed: {
            isReviewing() {
                return this.image.inReview;
            },
            isCurrentViewer() {
                return this.lastEventMapId == this.id;
            },
            hasFilters() {
                return this.filters.length > 0
            },
            hasImageSequences() {
                return this.imageSequences.length > 0
            },
            hasMultiViews() {
                return this.viewers.length > 1
            },
            hasOnlineUsers() {
                return this.onlineUsers.length > 0
            },
            hasAnnotationProperties() {
                return this.availableAnnotationProperties.length > 0
            },
            availableAnnotationProperties() {
                return this.annotationProperties.filter(item => this.selectedUserLayerIds.includes(parseInt(item.userId)))
            },
            allTermIds() {
                return this.allTerms.map(term => term.id);
            },
            selectedUserLayerIds() {
                return this.userLayers.filter(userLayer => userLayer.selected).map(userLayer => userLayer.id)
            },
            visibleUserLayerIds() {
                return this.userLayers.filter(userLayer => userLayer.selected && userLayer.visible).map(userLayer => userLayer.id)
            },
            filterUrl() {
                if (!this.selectedFilter)
                    return "";
                return `${this.selectedFilter.imagingServer}${this.selectedFilter.baseUrl}`;
            },
            viewerIndex() {
                return this.viewers.findIndex(map => map.id === this.id);
            },
            imageWidth() {
                return parseInt(this.image.width)
            },
            imageHeight() {
                return parseInt(this.image.height)
            },
            imageSize() {
                return [this.imageWidth, this.imageHeight]
            },
            fullHeight() {
                return this.innerHeight - this.paddingTop
            },
            elementHeight() {
                let heights = [
                    [this.fullHeight],
                    [this.fullHeight, this.fullHeight],
                    [this.fullHeight / 2, this.fullHeight / 2, this.fullHeight / 2],
                    [this.fullHeight / 2, this.fullHeight / 2, this.fullHeight / 2, this.fullHeight / 2],
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
            initialZoom() {
                let mapWidth = this.image.width;
                let mapHeight = this.image.height;
                let idealZoom = this.image.depth;
                while (mapWidth > this.elementWidth || mapHeight > this.elementHeight) {
                    mapWidth /= 2;
                    mapHeight /= 2;
                    idealZoom--;
                }
                return idealZoom
            },
            extent() {
                return [0, 0, this.imageWidth, this.imageHeight];
            },
            onlineAdmins() {
                return this.onlineUsers.filter(user => this.project.admins.find(u => u.id == user.id))
            },
            onlineContributors() {
                return differenceBy(this.onlineUsers.filter(user => this.project.users.find(u => u.id == user.id)),
                    this.onlineAdmins)
            },
        },
        watch: {
            linkedTo() {
                // Sets the local value to the value sent by the parent
                this.linkedToValues = this.linkedTo;
            },
            image(newImage, oldImage) {
                this.setNewImage(oldImage, newImage)
            },
            selectedSequence(newValue) {
                if (newValue !== {})
                    this.changeImage(newValue.model.id);
            },
            reviewMode() {
                this.updateReviewLayer()
            },
            // mapView: {
            //     handler() {
            //         let {mapCenter, mapResolution, mapRotation} = this.mapView;
            //         let index = this.linkedTo.findIndex(link => link == this.lastEventMapId);
            //         if (index >= 0) {
            //             this.$openlayers.getView(this.id).setProperties({
            //                 center: mapCenter,
            //                 resolution: mapResolution,
            //                 rotation: mapRotation,
            //             })
            //         }
            //     },
            //     deep: true,
            // },
            // selectedFilter() {
            //     //sets filter on change
            //     let layer = new OlTile({
            //         source: new Zoomify({
            //             url: `${this.filterUrl}${this.imsBaseUrl}&tileGroup={TileGroup}&z={z}&x={x}&y={y}&channels=0&layer=0&timeframe=0&mimeType=${this.image.mime}`,
            //             size: [this.imageWidth, this.imageHeight],
            //             extent: this.extent,
            //         }),
            //         extent: this.extent,
            //     });
            //     this.$openlayers.getMap(this.id).getLayers().getArray()[0] = layer;
            //     this.$openlayers.getMap(this.id).render();
            // },
            // centeredFeature(newValue) {
            //     if (newValue != this.image.project) {
            //         this.centerOnFeature(newValue);
            //     }
            // },
            // elementWidth(newValue) {
            //     this.$openlayers.getMap(this.id).setSize([newValue, this.elementHeight])
            // },
            // elementHeight(newValue) {
            //     this.$openlayers.getMap(this.id).setSize([this.elementWidth, newValue])
            // },
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
            incrementMaxZoom(value) {
                this.maxZoom += value;
            },
            changeImage(imageId) {
                this.$emit('changeImage', {viewerId: this.id, newImageId: imageId})
            },
            setNewImage(oldImage, newImage) {
                // Get available IMS servers for that image
                api.get(`/api/abstractimage/${newImage.baseImage}/imageservers.json`).then(response => {
                    this.imsServers = response.data.imageServersURLs;
                });

                // Change base layer

                // Reset position & zoom if necessary
                // Change maxZoom
                this.maxZoom = (oldImage) ? (this.maxZoom - oldImage.depth + newImage.depth) : newImage.depth;
                // Update feature layers
                // Update annotation indexes
                // Remove selected features
                this.reviewMode = (this.reviewMode && this.image.inReview
                    && this.image.reviewUser == this.currentUser.id);

                this.setUserLayers(!oldImage);

                api.get(`/api/annotation/property/key.json?idImage=${newImage.id}&user=true`).then(data => {
                    this.annotationProperties = data.data.collection;
                });

                this.getOnlineUsers();

                api.get(`/api/imageinstance/${newImage.id}/imagesequence.json`).then(data => {
                    this.imageSequences = data.data.collection;
                });
                // If current sequence no more in imagesequence: deselect it
            },
            setUserLayers(selectDefaultLayers = true) {
                this.updateReviewLayer();

                api.get(`/api/project/${this.image.project}/userlayer.json?image=${this.image.id}`).then(response => {
                    let layers = response.data.collection;
                    layers.forEach(userLayer => {
                        let indexExist = this.userLayers.findIndex(l => l.id == userLayer.id);
                        if (indexExist == -1) {
                            userLayer.size = 0;
                            userLayer.selected = false;
                            userLayer.visible = false;
                            userLayer.drawable = false;
                            userLayer.opacity = 0.3;
                            this.userLayers.push(userLayer);
                        }
                    });
                    api.get(`/api/imageinstance/${this.image.id}/annotationindex.json`).then(response => {
                        response.data.collection.forEach(item => {
                            let index = this.userLayers.findIndex(user => item.user == user.id);
                            let layer = this.userLayers[index];
                            layer.size = item.countAnnotation;
                            this.userLayers.splice(index, 1, layer);
                        });

                        if (selectDefaultLayers) {
                            api.get(`/api/project/${this.image.project}/defaultlayer.json`).then(response => {
                                if (response.data.collection[0]) {
                                    response.data.collection.map(l => {
                                        let index = this.userLayers.findIndex(user => user.id == l.user);
                                        let layer = this.userLayers[index];
                                        layer.selected = true;
                                        layer.visible = true;
                                        this.userLayers.splice(index, 1, layer);
                                    });
                                } else {
                                    let index = this.userLayers.findIndex(user => user.id == this.currentUser.id);
                                    let layer = this.userLayers[index];
                                    layer.selected = true;
                                    layer.visible = true;
                                    layer.drawable = true;
                                    this.userLayers.splice(index, 1, layer);
                                }
                            })
                        }
                    });
                })
            },
            updateLayer(payload) {
                this.userLayers.splice(payload.index, 1, payload.layer);
            },
            updateReviewLayer() {
                let reviewIndex = this.userLayers.findIndex(l => l.id == -100);
                if (reviewIndex == -1) {
                    let reviewLayer = {
                        id: -100,
                        size: 0,
                        selected: this.reviewMode || this.image.reviewed,
                        visible: this.reviewMode,
                        drawable: this.reviewMode,
                        opacity: 0.3,
                        review: true,
                    };
                    this.userLayers.push(reviewLayer);
                }
                else {
                    let reviewLayer = this.userLayers[reviewIndex];
                    reviewLayer.size = 0;
                    reviewLayer.selected = this.reviewMode || this.image.reviewed;
                    reviewLayer.visible = this.reviewMode;
                    reviewLayer.drawable = this.reviewMode;
                    this.userLayers.splice(reviewIndex, 1, reviewLayer);
                }
            },
            toggleVisibilityTerm(termId) {
                let index = this.visibleTerms.findIndex(t => t == termId);
                if (index == -1)
                    this.visibleTerms.push(termId);
                else
                    this.visibleTerms.splice(index, 1)
            },
            toggleAssociateTerm(termId) {
                let index = this.associableTerms.findIndex(t => t == termId);
                if (index == -1)
                    this.associableTerms.push(termId);
                else
                    this.associableTerms.splice(index, 1)
            },
            showAllTerms(bool) {
                if (bool) {
                    this.visibleTerms = clone(this.allTermIds);
                    this.visibleNoTerm = true;
                }
                else {
                    this.visibleTerms = [];
                    this.visibleNoTerm = false;
                }
            },
            getOnlineUsers() {
                api.get(`/api/project/${this.project.id}/online/user.json?image=${this.image.id}`).then(response => {
                    this.onlineUsers = response.data.collection;
                })
            },
            userById(userId, list = this.project.users) {
                return list.find(user => user.id === userId);
            },
            changeSequence(payload) {
                api.get(`/api/imagegroup/${this.selectedSequence.imageGroup}/${payload.c}/${payload.z}/0/${payload.t}/imagesequence.json`).then(response => {
                    this.selectedSequence = response.data;
                })
            },
            changeReviewStatus(payload) {
                if (payload == 'start') {
                    api.post(`/api/imageinstance/${this.image.id}/review.json`).then(response => {
                        this.reviewMode = true;
                        this.$emit('updateImage', response.data.imageinstance);
                    });
                }
                else if (payload == 'cancel' || payload == 'unvalidate') {
                    api.delete(`/api/imageinstance/${this.image.id}/review.json?cancel=true`).then(response => {
                        if (payload == 'cancel') this.reviewMode = false;
                        if (payload == 'unvalidate') this.reviewMode = true;
                        this.$emit('updateImage', response.data.imageinstance);
                    })
                }
                else if (payload == 'validate') {
                    api.delete(`/api/imageinstance/${this.image.id}/review.json?cancel=false`).then(response => {
                        this.reviewMode = false;
                        this.$emit('updateImage', response.data.imageinstance);
                    })
                }
            },
            randomImsServer() {
                return sample(this.imsServers);
            },
            baseLayerUrl() {
                return `${this.filterUrl}${this.randomImsServer()}&tileGroup={TileGroup}&z={z}&x={x}&y={y}&mimeType=${this.image.mime}`
            },
            // // Sends view infos
            // sendView(e) {
            //     let payload = {
            //         mapId: this.id,
            //         view: this.$openlayers.getView(this.id),
            //     };
            //     let rect = this.$refs.exploreMap.getBoundingClientRect();
            //     this.mousePosition = [
            //         e.clientX - rect.left,
            //         e.clientY - rect.top
            //     ];
            //     this.$emit('dragged', payload);
            // },
            // postPosition() {
            //     let extent = this.$openlayers.getView(this.id).calculateExtent();
            //     let payload = {
            //         bottomLeftX: Math.round(extent[0]),
            //         bottomLeftY: Math.round(extent[1]),
            //         bottomRightX: Math.round(extent[2]),
            //         bottomLeftY: Math.round(extent[1]),
            //         image: parseInt(this.imageId),
            //         topLeftX: Math.round(extent[0]),
            //         topLeftY: Math.round(extent[3]),
            //         topRightX: Math.round(extent[2]),
            //         topRightY: Math.round(extent[3]),
            //         zoom: this.$openlayers.getView(this.id).getZoom(),
            //     };
            //     api.post(`/api/imageinstance/${this.imageId}/position.json`, payload);
            // },

            // centerOnFeature(id) {
            //     if (id == 0 || id == '') {
            //         return;
            //     }
            //     api.get(`/api/annotation/${id}.json`).then(response => {
            //         let annotation = response.data;
            //         let format = new WKT();
            //         let feature = format.readFeature(annotation.location);
            //         let annotLayer = this.$openlayers.getMap(this.id).getLayers().getArray().findIndex(layer => layer.get('title') == annotation.user);
            //         if (annotLayer < 0) {
            //             this.addLayer = annotation.user;
            //         }
            //         this.$openlayers.getView(this.id).fit(feature.getGeometry());
            //     })
            // },
            //
            // showTerms(payload) {
            //     this.termsToShow = payload;
            // },
            // setShowWithNoTerm(payload) {
            //     this.showWithNoTerm = payload;
            // },
            // setAllTerms(payload) {
            //     this.allTerms = payload;
            // },
            // setFeatureSelected(payload) {
            //     this.featureSelected = payload;
            // },
            // setUserLayers(payload) {
            //     this.userLayers = payload;
            // },
            // setLayersSelected(payload) {
            //     this.layersSelected = payload;
            // },
            // changeImage(payload) {
            //     api.get(`/api/abstractimage/${payload.baseImage}/imageservers.json?&imageinstance=${payload.id}`).then(response => {
            //         this.imsBaseUrl = response.data.imageServersURLs[0];
            //
            //         let reset = this.image.width != payload.width || this.image.height != payload.height;
            //         this.$emit('updateMap', {old: this.currentMap, new: payload});
            //
            //         this.extent = [0, 0, this.imageWidth, this.imageHeight];
            //         if (reset) {
            //             this.$openlayers.getView(this.id).setCenter([this.imageWidth / 2, this.imageHeight / 2]);
            //             this.$openlayers.getView(this.id).setZoom(this.initialZoom);
            //             this.$openlayers.getView(this.id).getProjection().setExtent(this.extent);
            //             this.zoom = this.$openlayers.getView(this.id).getZoom();
            //         }
            //
            //         let layer = new OlTile({
            //             source: new Zoomify({
            //                 url: `${this.filterUrl}${this.imsBaseUrl}&tileGroup={TileGroup}&z={z}&x={x}&y={y}&channels=0&layer=0&timeframe=0&mimeType=${this.image.mime}`,
            //                 size: [this.imageWidth, this.imageHeight],
            //                 extent: this.extent,
            //             }),
            //             extent: this.extent,
            //         });
            //
            //         // Find a way to avoid "blank flashes" when image change at least for multidimensional images.
            //         // let oldLayers = this.$openlayers.getMap(this.id).getLayers().getArray();
            //         // this.$openlayers.getMap(this.id).addLayer(layer);
            //         // oldLayers.forEach(layer => this.$openlayers.getMap(this.id).removeLayer(layer));
            //         this.$openlayers.getMap(this.id).setLayerGroup(new Group({layers: [layer]}));
            //
            //         this.$openlayers.getView(this.id).setMaxZoom(this.image.depth);
            //         this.maxZoom = this.$openlayers.getView(this.id).getMaxZoom();
            //
            //         this.setUpdateLayers(true);
            //         this.setUpdateAnnotationsIndex(true);
            //         this.setFeatureSelected(undefined);
            //     });
            // },
            // setVectorLayersOpacity(payload) {
            //     this.vectorLayersOpacity = payload;
            // },
            // setImageGroup(payload) {
            //     this.imageGroup = payload;
            // },
            // setFeatureSelectedData(payload) {
            //     this.featureSelectedData = payload;
            // },
            // setUpdateLayers(payload) {
            //     this.updateLayers = payload;
            // },
            // setUpdateAnnotationsIndex(payload) {
            //     this.updateAnnotationsIndex = payload;
            // },
            // setSelectedComponent(component) {
            //     if (component == this.selectedComponent) {
            //         this.selectedComponent = '';
            //     } else {
            //         this.selectedComponent = component;
            //     }
            // },
            mustBeShown(key) {
                return mustBeShown(key, this.projectConfig);
            },
            getTerms(children) {
                let terms = [];
                children.forEach(child => {
                    terms.push(child);
                    terms = terms.concat(this.getTerms(child.children))
                });
                return terms;
            },
        },
        created() {
            this.getWindowWidth();
            this.getWindowHeight();

            let cytomineProjection = createProj({
                code: 'CYTO:FLAT',
                units: 'pixels',
                extent: this.extent,
            });
            addProj(cytomineProjection);

            this.setNewImage(null, this.image);
        },
        mounted() {
            this.$nextTick(function () {
                window.addEventListener('resize', this.getWindowHeight);
                window.addEventListener('resize', this.getWindowWidth);
            });

            this.$refs.map.$createPromise.then(() => {
                // this.$refs.map.$map.addControl(new ScaleLine())
                this.$refs.map.$map.getControls().getArray()[0].element.childNodes.forEach(child => {
                    child.classList.add('btn');
                    child.classList.add('btn-default');
                });
                this.$refs.map.$map.getControls().getArray()[1].element.childNodes.forEach(child => {
                    child.classList.add('btn');
                    child.classList.add('btn-default');
                });
            });

            this.allTerms = this.getTerms(this.ontology.children);
            this.visibleTerms = clone(this.allTermIds);
            this.allTermIds.forEach(term => {
                this.$set(this.sizeTerms, term, 0)
            });

            setInterval(this.getOnlineUsers.bind(this), 5000);

            // Init map
            // this.$openlayers.init({
            //     element: this.id,
            //     center: [this.imageWidth / 2, this.imageHeight / 2],
            //     zoom: this.initialZoom,
            //     controls: [
            //         new ZoomControls({
            //             target: document.getElementById('controls-' + this.id),
            //         }),
            //         new RotateControls({
            //             target: document.getElementById('controls-' + this.id),
            //         })
            //     ],
            //     enablePan: true,
            //     enableMouseWheelZoom: true,
            //     enableDoubleClickZoom: true,
            //     minZoom: 0,
            //     projection: {
            //         code: 'CYTO',
            //         extent: this.extent,
            //     },
            // });
            // api.get(`/api/abstractimage/${this.image.baseImage}/imageservers.json`).then(response => {
            //     this.imsBaseUrl = response.data.imageServersURLs[0];
            //     // Adds layer
            //     let layer = new OlTile({
            //         source: new Zoomify({
            //             url: `${this.filterUrl}${this.imsBaseUrl}&tileGroup={TileGroup}&z={z}&x={x}&y={y}&channels=0&layer=0&timeframe=0&mimeType=${this.image.mime}`,
            //             size: [this.imageWidth, this.imageHeight],
            //             extent: this.extent,
            //         }),
            //         extent: this.extent,
            //     });
            //     this.$openlayers.getMap(this.id).addLayer(layer);
            //     this.$openlayers.getView(this.id).setMaxZoom(this.image.depth);
            //     this.$openlayers.getMap(this.id).on('moveend', () => {
            //         this.zoom = this.$openlayers.getView(this.id).getZoom();
            //         this.maxZoom = this.$openlayers.getView(this.id).getMaxZoom();
            //     });
            //     this.$openlayers.getMap(this.id).on('moveend', () => {
            //         this.postPosition();
            //     });
            //
            //     setInterval(this.postPosition, 5000);
            //
            //     if (this.isReviewing) {
            //         api.put(`/api/imageinstance/${this.imageId}/review.json`, {
            //             id: this.imageId,
            //         }).then(response => {
            //             this.changeImage(response.data.imageinstance)
            //         })
            //     }
            //     if (this.centeredFeature != '' && this.centeredFeature != this.image.project) {
            //         this.centerOnFeature(this.centeredFeature);
            //     }
            // });
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.getWindowHeight);
            window.removeEventListener('resize', this.getWindowWidth);
        }
    }

</script>

<style scoped>

</style>

<style>
    .map {
        position: relative;
        overflow: hidden;
    }

    .ol-mouse-position {
        top: 8px;
        right: 8px;
        position: absolute;
    }

    .ol-unsupported {
        display: none;
    }

    .ol-viewport, .ol-unselectable {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
    }

    .ol-selectable {
        -webkit-touch-callout: default;
        -webkit-user-select: auto;
        -moz-user-select: auto;
        -ms-user-select: auto;
        user-select: auto;
    }

    .ol-grabbing {
        cursor: -webkit-grabbing;
        cursor: grabbing;
    }

    .ol-grab {
        cursor: move;
        cursor: -webkit-grab;
        cursor: grab;
    }

    .ol-control {
        position: absolute;
    }

    .ol-rotate {
        top: 1em;
        right: 1em;
        -webkit-transition: opacity .25s linear, visibility 0s linear;
        transition: opacity .25s linear, visibility 0s linear;
    }

    .ol-rotate.ol-hidden {
        opacity: 0;
        visibility: hidden;
        -webkit-transition: opacity .25s linear, visibility 0s linear .25s;
        transition: opacity .25s linear, visibility 0s linear .25s;
    }

    .vl-map {
        width: 100%;
        height: 100%;
    }

    .ol-zoom {
        top: 1em;
        left: 1em;
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
        padding-top: 0;
    }

    .component-panel-bottom {
        bottom: 4em;
        left: 1em;
        margin-right: 1em;
    }
</style>
