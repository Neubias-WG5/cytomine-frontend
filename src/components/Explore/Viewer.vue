<template>
    <div :style="`height:${elementHeightPercentage}%;width:${elementWidthPercentage}%;`" class="map">
        <vl-map ref="olmap" :load-tiles-while-animating="true" :load-tiles-while-interacting="true"
                @pointermove="mousePosition = $event.coordinate" @mounted="onMapMounted" @moveend="calculateViewExtent"
                data-projection="CYTO:FLAT">

            <vl-view ref="olview" :center.sync="center" :zoom.sync="zoom" :max-zoom="maxZoom"
                     :rotation.sync="rotation" :resolution.sync="resolution" projection="CYTO:FLAT"></vl-view>

            <vl-layer-tile :extent="imageExtent">
                <vl-source-zoomify :url="baseLayerUrl()" :size="imageSize" projection="CYTO:FLAT"
                                   :extent="imageExtent" :key="baseLayerUrl()"
                                   v-if="imsServers.length > 0"></vl-source-zoomify>
            </vl-layer-tile>

            <annotation-layer v-for="userLayer in userLayers" :key="'layer'+userLayer.id"
                                      :image="image" :user-layer="userLayer" :visible-terms="visibleTerms"
                                      :visible-no-term="visibleNoTerm" :selected-property="selectedProperty"
                                      :is-reviewing="isReviewing" :extent="viewExtent" :image-extent="imageExtent"
                                      :terms="allTerms" :layer-opacity="layersOpacity"
                                      :styles="styles"></annotation-layer>

            <select-interaction :active-tool="activeTool" :selected-feature.sync="selectedFeature" :styles="styles"
                                :layer-opacity="layersOpacity" :visible-terms="visibleTerms"
                                :visible-no-term="visibleNoTerm" :associable-terms="associableTerms"></select-interaction>

            <measure-interaction :image="image" :active-tool="activeTool"></measure-interaction>

            <draw-interaction :active-tool="activeTool" :user-layers="userLayers" :associable-terms="associableTerms"
                              :drawable-layer-ids="drawableUserLayerIds" :image="image" :current-user="currentUser"
                              :selected-feature.sync="selectedFeature" @selectFeature="selectFeature"
                              :is-reviewing="isReviewing"
                              @updateAnnotationIndexes="updateAnnotationIndexes"
                              @forceUpdateLayer="forceUpdateLayer"></draw-interaction>

            <modify-interaction :active-tool.sync="activeTool" :image="image" :current-user="currentUser"
                                :selected-feature.sync="selectedFeature" @selectFeature="selectFeature"
                                :is-reviewing="isReviewing" @updateAnnotationIndexes="updateAnnotationIndexes"
                                @updateFeature="updateFeature"></modify-interaction>
        </vl-map>

        <viewer-toolbar v-show="isCurrentViewer" :active-tool.sync="activeTool" :current-user="currentUser"
                        :project="project"
                        :project-config="projectConfig" :selected-feature="selectedFeature"
                        :drawable-layer-ids="drawableUserLayerIds"></viewer-toolbar>

        <div :id="'overviewmap-'+id" class="overview-container"></div>
        <div v-show="isCurrentViewer">
            <viewer-buttons :selected-component.sync="selectedComponent" @deleteViewer="deleteViewer"
                            :has-multi-views="hasMultiViews" :is-reviewing="isReviewing" :has-filters="hasFilters"
                            :has-image-sequences="hasImageSequences"
                            :has-annotation-properties="hasAnnotationProperties"
                            :project-config="projectConfig" :has-online-users="hasOnlineUsers"
                            :review-mode="reviewMode"></viewer-buttons>

            <div class="scale-line-panel">
                <scale-line :image="image" :mousePosition="mousePosition"
                            :currentZoom="zoom" :maxZoom="maxZoom"></scale-line>
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
                                   :show-review="reviewMode || image.reviewed" :layer-opacity.sync="layersOpacity">
                </annotation-layers>

                <ontology v-show="selectedComponent == 'ontology'" :project="project" :ontology="ontology"
                          :visible-terms="visibleTerms" :associable-terms="associableTerms" :size-terms="sizeTerms"
                          :visible-no-term.sync="visibleNoTerm" @toggleAssociateTerm="toggleAssociateTerm"
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
                                    && hasAnnotationProperties"
                            :properties="availableAnnotationProperties" :selected-property.sync="selectedProperty">
                </properties>

                <div v-show="selectedComponent == 'follow' && mustBeShown('project-explore-follow') && hasOnlineUsers">
                    <h4>
                        <i class="fas fa-chess-rook"></i> Follow online users
                    </h4>
                    <div class="alert alert-info">Choose a user to follow</div>

                    <div class="radio">
                        <input v-model="followedUser" type="radio" :name="'follow-no-' + id"
                               :id="'follow-no-' + id" value="" @change="stopUserTracking()">
                        <label :for="'follow-no-' + id">No tracking</label>
                    </div>
                    <template v-if="onlineAdmins.length > 0">
                        <h4>Managers</h4>
                        <div class="radio">

                            <div v-for="userId in onlineAdmins" :key="userId">
                                <input v-model="followedUser" type="radio" :name="'follow-'+userId+'-' + id"
                                       :id="'follow-'+userId+'-' + id" :value="userId" @change="startUserTracking()">
                                <label :for="'follow-'+userId+'-' + id">
                                    <username :user="userById(userId)"></username>
                                </label>
                            </div>
                        </div>
                    </template>
                    <template v-if="onlineContributors.length > 0">
                        <h4>Contributors</h4>
                        <div class="radio">
                            <div v-for="userId in onlineContributors" :key="userId">
                                <input v-model="followedUser" type="radio" :name="'follow-'+userId+'-' + id"
                                       :id="'follow-'+userId+'-' + id" :value="userId" @change="startUserTracking()">
                                <label :for="'follow-'+userId+'-' + id">
                                    <username :user="userById(userId)"></username>
                                </label>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>

        <annotation-details v-show="selectedFeature" :users="userLayers"
                            :terms="allTerms" :selected-feature.sync="selectedFeature"
                            :project-config="projectConfig" :currentUser="currentUser" :project="project"
                            :element-height="elementHeight" :element-width="elementWidth" @updateFeature="updateFeature"
                            @toogleAssociateTerm="toggleAssociateTerm" :associable-terms.sync="associableTerms">
        </annotation-details>
    </div>
</template>

<script>
    import AnnotationLayers from './Panels/AnnotationLayers'
    import Annotations from './Panels/Annotations';
    import Properties from './Panels/Properties';
    import Multidimension from './Panels/Multidimension';
    import DigitalZoom from './Panels/DigitalZoom'
    import Review from './Panels/Review'
    import Informations from './Panels/Informations';
    import Ontology from './Panels/Ontology';
    import ColorMaps from './Panels/Colormaps'
    import Filters from "./Panels/Filters";
    import NavigationImage from "./Panels/NavigationImage";

    import SelectInteraction from "./Interactions/SelectInteraction";
    import MeasureInteraction from "./Interactions/MeasureInteraction";
    import DrawInteraction from "./Interactions/DrawInteraction";
    import ModifyInteraction from "./Interactions/ModifyInteraction";
    import Interactions from './Interactions/Interactions';

    import Username from "../User/Username";
    import ScaleLine from './ScaleLine'
    import ViewerButtons from "./ViewerButtons";
    import ViewerToolbar from "./ViewerToolbar";
    import AnnotationLayer from "./AnnotationLayer";
    import AnnotationDetails from './CurrentSelection/AnnotationDetails';

    import View from 'ol/view';
    import GeoJSON from 'ol/format/geojson';
    import OverviewMap from 'ol/control/overviewmap'
    import {addProj, createProj} from "vuelayers/lib/_esm/ol-ext";

    import mustBeShown from '../../helpers/mustBeShown';
    import clone from "lodash.clone";
    import differenceBy from "lodash.differenceby"
    import sample from "lodash.sample";
    import debounce from "lodash.debounce";

    export default {
        name: 'Viewer',
        components: {
            ModifyInteraction,
            DrawInteraction,
            MeasureInteraction,
            SelectInteraction,
            ViewerToolbar,
            AnnotationLayer,
            Username,
            NavigationImage,
            Filters,
            ViewerButtons,
            AnnotationLayers,
            Interactions,
            Informations,
            Ontology,
            AnnotationDetails,
            Annotations,
            Properties,
            Multidimension,
            DigitalZoom,
            Review,
            ScaleLine,
            ColorMaps,
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
                layersOpacity: 0.3,
                selectedFeature: undefined,
                activeTool: 'Select',
                selectedProperty: {
                    key: "",
                    color: '#000000'
                },

                userLayers: [],
                visibleTerms: [],
                associableTerms: [],
                sizeTerms: {},
                visibleNoTerm: false,
                annotationProperties: [],
                onlineUsers: [],
                imageSequences: [],
                imsServers: [],

                center: [0, 0],
                zoom: 0,
                maxZoom: 0,
                rotation: 0,
                resolution: undefined,
                clickCoordinate: undefined,
                selectedFeatures: [],
                viewExtent: [0, 0, 0, 0],
                projection: null,

                imsBaseUrl: '',
                mousePosition: [0, 0],
                termsToShow: [],
                showWithNoTerm: true,
                featureSelected: undefined,
                featureSelectedData: {},
                layersSelected: [],

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
            'styles',

            'id',
            'linkedTo',
            'image',
            'linkedViewersBus',
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
            allTerms() {
                return this.ontology.allTerms;
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
            drawableUserLayerIds() {
                return this.userLayers.filter(userLayer => userLayer.selected && userLayer.drawable).map(userLayer => userLayer.id)
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
            imageExtent() {
                return [0, 0, this.imageWidth, this.imageHeight];
            },
            projectionExtent() {
                return [-this.imageWidth / 2, -this.imageHeight / 2, this.imageWidth / 2, this.imageHeight / 2];
            },
            onlineAdmins() {
                return this.onlineUsers.filter(id => this.project.admins.find(u => u.id == id))
            },
            onlineContributors() {
                return differenceBy(this.onlineUsers.filter(id => this.project.users.find(u => u.id == id)),
                    this.onlineAdmins)
            },
            viewState() {
                return {
                    'id': this.id,
                    'center': this.center,
                    'zoom': this.zoom,
                    'rotation': this.rotation
                }
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
                this.updateReviewLayer();
                this.saveImageConsultation();
            },
            elementWidth(newValue) {
                this.$refs.olmap.$createPromise.then(() => {
                    this.$refs.olmap.$map.setSize([newValue, this.elementHeight])
                });
            },
            elementHeight(newValue) {
                this.$refs.olmap.$createPromise.then(() => {
                    this.$refs.olmap.$map.setSize([this.elementWidth, newValue])
                });
            },
            mousePosition() {
                if (!this.isCurrentViewer)
                    this.$emit('setCurrentViewer', this.id);
            },
            viewState(newValue) {
                this.debouncedSavePosition();
                if (this.linkedTo.length > 0)
                    this.linkedViewersBus.$emit('updateViewState', newValue);
            },
            onlineUsers(newValue) {
                if (this.followedUser !== "") {
                    if (newValue.find(u => u.id == this.followedUser.id) == -1) {
                        this.stopUserTracking()
                    }
                }
            },
            activeTool(newValue) {
                console.log("activeTool new Value" + newValue);
                if (!['Select', 'Fill', 'Edit', 'Rotate', 'Drag', 'Resize', 'Remove'].includes(newValue))
                    this.selectedFeature = null;
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
                let reset = !oldImage || newImage.width != oldImage.width || newImage.height != oldImage.height;
                if (reset) {
                    this.center = [this.imageWidth / 2, this.imageHeight / 2];
                    this.zoom = this.initialZoom;
                }

                // Change maxZoom
                this.maxZoom = (oldImage) ? (this.maxZoom - oldImage.depth + newImage.depth) : newImage.depth;
                // Update feature layers
                // Update annotation indexes
                // Remove selected features
                this.reviewMode = (this.reviewMode && this.image.inReview
                    && this.image.reviewUser == this.currentUser.id);

                this.setUserLayers(!oldImage);

                this.selectedFeature = undefined;

                api.get(`/api/annotation/property/key.json?idImage=${newImage.id}&user=true`).then(data => {
                    this.annotationProperties = data.data.collection;
                });

                // TODO: if selected property no more in annotation properties: remove it

                api.get(`/api/imageinstance/${newImage.id}/imagesequence.json`).then(data => {
                    this.imageSequences = data.data.collection;
                });

                // TODO: If current sequence no more in imagesequence: deselect it

                this.getOnlineUsers();

                // Add new image consultation
                this.saveImageConsultation()
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
                            userLayer.clearAllRev = 0;
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
            updateAnnotationIndexes() {
                api.get(`/api/imageinstance/${this.image.id}/annotationindex.json`).then(response => {
                    response.data.collection.forEach(item => {
                        let index = this.userLayers.findIndex(user => item.user == user.id);
                        let layer = this.userLayers[index];
                        layer.size = item.countAnnotation;
                        this.userLayers.splice(index, 1, layer);
                    });
                })
            },
            forceUpdateLayer(layerId) {
                let index = this.userLayers.findIndex(user => layerId == user.id);
                let layer = this.userLayers[index];
                layer.clearAllRev++;
                this.userLayers.splice(index, 1, layer);
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
                        clearAllRev: 0,
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
                if (this.isCurrentViewer) {
                    api.get(`/api/imageinstance/${this.image.id}/online.json`).then(response => {
                        this.onlineUsers = response.data.users.filter(id => id != this.currentUser.id);
                    })
                }
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
            saveImageConsultation() {
                api.post(`api/imageinstance/${this.image.id}/consultation.json`, {
                    image: this.image.id,
                    mode: (this.reviewMode) ? "review" : "view"
                })
            },
            savePosition() {
                if (this.$refs.olview)
                    this.$refs.olview.$createPromise.then(() => {
                        let extent = this.$refs.olview.$view.calculateExtent();
                        api.post(`api/imageinstance/${this.image.id}/position.json`, {
                            image: this.image.id,
                            zoom: this.zoom,
                            rotation: this.rotation,
                            bottomLeftX: Math.round(extent[0]),
                            bottomLeftY: Math.round(extent[1]),
                            bottomRightX: Math.round(extent[2]),
                            bottomRightY: Math.round(extent[1]),
                            topLeftX: Math.round(extent[0]),
                            topLeftY: Math.round(extent[3]),
                            topRightX: Math.round(extent[2]),
                            topRightY: Math.round(extent[3]),
                        })
                    })
            },
            trackUser() {
                if (this.followedUser != "" && this.$refs.olview) {
                    api.get(`api/imageinstance/${this.image.id}/position/${this.followedUser}.json`).then(response => {
                        this.$refs.olview.$createPromise.then(() => {
                            this.$refs.olview.animate({
                                center: [response.data.x, response.data.y],
                                zoom: response.data.zoom,
                                rotation: response.data.rotation,
                            })
                        })
                    })
                }
            },
            startUserTracking() {
                let user = this.userById(this.followedUser);
                this.$notify({
                    placement: 'bottom-right',
                    type: 'success',
                    content: `You started following ${user.firstname} ${user.lastname} (${user.username}).`
                })
            },
            stopUserTracking() {
                this.$notify({
                    placement: 'bottom-right',
                    type: 'info',
                    content: `Stopped following an online user.`
                });

                this.followedUser = "";
            },
            onMapMounted() {
                this.$refs.olmap.$createPromise.then(() => {
                    this.$refs.olmap.$map.getControls().getArray()[0].element.childNodes.forEach(child => {
                        child.classList.add('btn');
                        child.classList.add('btn-default');
                    });
                    this.$refs.olmap.$map.getControls().getArray()[1].element.childNodes.forEach(child => {
                        child.classList.add('btn');
                        child.classList.add('btn-default');
                    });

                    this.$refs.olmap.$map.addControl(new OverviewMap({
                        label: '«',
                        collapseLabel: '»',
                        collapsed: false,
                        view: new View({projection: this.projection})
                    }));

                    this.$refs.olmap.$map.getControls().getArray()[3].element.childNodes[1].classList.add('btn');
                    this.$refs.olmap.$map.getControls().getArray()[3].element.childNodes[1].classList.add('btn-default');
                });
            },
            calculateViewExtent() {
                if (!this.$refs.olview)
                    return;

                this.$refs.olview.$createPromise.then(() => {
                    this.viewExtent = this.$refs.olview.$view.calculateExtent();
                })
            },
            selectFeature(payload) {
                let layer = this.$refs.olmap.getLayerById(`layer${payload.layerId}`);
                let retries = 0;
                let interval = setInterval(() => {
                    retries++;
                    let feature = layer.getSource().getFeatureById(payload.featureId);
                    if (feature != null) {
                        clearInterval(interval);
                        this.selectedFeature = {
                            type: 'Feature',
                            id: feature.getId(),
                            geometry: new GeoJSON().writeFeature(feature),
                            properties: {
                                class: feature.get('class'),
                                id: feature.get('id'),
                                terms: feature.get('terms'),
                                user: feature.get('user'),
                                clusterSize: feature.get('clusterSize')
                            }
                        }
                    }
                    else if (retries == 5)
                        clearInterval(interval);
                }, 500);
            },
            updateFeature(payload) {
                let layer = this.$refs.olmap.getLayerById(`layer${payload.layerId}`);
                let retries = 0;
                let interval = setInterval(() => {
                    retries++;
                    let feature = layer.getSource().getFeatureById(payload.featureId);
                    if (feature != null) {
                        clearInterval(interval);
                        if (payload.geometry)
                            feature.setGeometry(payload.geometry);

                        if (payload.terms)
                            feature.set('terms', payload.terms);

                        feature.changed();
                    }
                    else if (retries == 5)
                        clearInterval(interval);
                }, 500);
            },
            mustBeShown(key) {
                return mustBeShown(key, this.projectConfig);
            },
        },
        created() {
            this.getWindowWidth();
            this.getWindowHeight();

            this.projection = createProj({
                code: 'CYTO:FLAT',
                units: 'pixels',
                extent: this.projectionExtent,
            });
            addProj(this.projection);

            this.setNewImage(null, this.image);

            this.linkedViewersBus.$on('updateViewState', (payload) => {
                if (this.linkedTo.includes(payload.id)) {
                    this.center = payload.center;
                    this.zoom = payload.zoom;
                    this.rotation = payload.rotation;
                }
            });

            this.debouncedSavePosition = debounce(this.savePosition, 500);
        },
        mounted() {
            this.$nextTick(function () {
                window.addEventListener('resize', this.getWindowHeight);
                window.addEventListener('resize', this.getWindowWidth);
            });


            this.visibleTerms = clone(this.allTermIds);
            this.allTermIds.forEach(term => {
                this.$set(this.sizeTerms, term, 0)
            });

            setInterval(this.getOnlineUsers.bind(this), 5000);
            setInterval(this.savePosition.bind(this), 5000);
            setInterval(this.trackUser.bind(this), 1000);
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

    .ol-overlay-container {
        will-change: left, right, top, bottom;
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

    .ol-zoom {
        top: 1em;
        left: 1em;
        display: flex;
        flex-direction: column;
    }

    .ol-rotate {
        top: 8em;
        left: 1em;
        -webkit-transition: opacity .25s linear, visibility 0s linear;
        transition: opacity .25s linear, visibility 0s linear;
    }

    .ol-rotate.ol-hidden {
        opacity: 0;
        visibility: hidden;
        -webkit-transition: opacity .25s linear, visibility 0s linear .25s;
        transition: opacity .25s linear, visibility 0s linear .25s;
    }

    .ol-zoom-in, .ol-zoom-out, .ol-rotate-reset {
        height: 2.5em;
    }

    .ol-zoom-in, .ol-zoom-out {
        margin-bottom: 1em;
    }

    .ol-overviewmap {
        top: 1em;
        right: 1em;
    }

    .ol-overviewmap.ol-uncollapsible {
        right: 0;
        top: 0;
        border-radius: 0 4px 0 0;
    }

    .ol-overviewmap .ol-overviewmap-map,
    .ol-overviewmap button {
        display: inline-block;
    }

    .ol-overviewmap .ol-overviewmap-map {
        height: 150px;
        width: 150px;
    }

    .ol-overviewmap:not(.ol-collapsed) button {
        top: 1px;
        right: 2px;
        position: absolute;
    }

    .ol-overviewmap.ol-collapsed .ol-overviewmap-map,
    .ol-overviewmap.ol-uncollapsible button {
        display: none;
    }

    .ol-overviewmap:not(.ol-collapsed) {
        border: 3px solid black;
        background: grey;
    }

    .ol-overviewmap-box {
        border: 2px dotted red;
    }

    .ol-overviewmap .ol-overviewmap-box:hover {
        cursor: move;
    }

    .vl-map {
        width: 100%;
        height: 100%;
    }

    .ol-attribution {
        display: none;
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
