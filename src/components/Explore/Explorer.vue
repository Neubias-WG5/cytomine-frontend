<template>
    <div>
        <div class="explorer-header">
            <viewer-selector :project="project" :images="images" :nb-viewers="viewers.length"
                             :nb-max-viewers="nbMaxViewers" @add-viewer="addViewer"></viewer-selector>
        </div>

        <div class="maps-container" :style="`height: calc(100vh - ${paddingTop}px);`">
            <viewer v-for="viewer in viewers" :key="viewer.id" :currentRoute="currentRoute"
                    :project="project" :project-config="projectConfig" :filters="filters" :image-groups="imageGroups"
                    :current-user="currentUser" :viewers="viewers" :currentMap="viewer" :padding-top="paddingTop"
                    @deleteViewer="deleteViewer"
                    @updateMap="updateMap" @dragged="setMap" @mapIsLinked="linkMaps"
                    :mapView="mapView" :lastEventMapId="lastEventMapId"></viewer>
        </div>
    </div>
</template>

<script>
    import Viewer from './Viewer'

    import uuid from 'uuid'
    import ViewerSelector from "./ViewerSelector";

    export default {
        name: 'app',
        components: {
            ViewerSelector,
            Viewer,
        },
        data() {
            return {
                nbMaxViewers: 4,
                viewers: [],
                project: {},
                projectConfig: {},
                images: [],
                filters: [],
                imageGroups: [],
                onlineUsers: [],
                currentUser: {},

                mapView: {
                    mapCenter: [0, 0],
                    mapZoom: 2,
                    mapRotation: 0,
                },
                lastEventMapId: null,
                currentRoute: '',
                paddingTop: 50 + 42 + 40,
            }
        },
        computed: {
            backboneTabIndex() {
                // DEPENDS ON [BACKBONE]
                return window.app.status.currentImages.findIndex(tab => window.app.status.currentImage.idImage == tab.image);
            },
            projectId() {
                // DEPENDS ON [BACKBONE]
                return window.app.status.currentProject;
            },
            baseImage() {
                // DEPENDS ON [BACKBONE]
                return window.app.status.currentImages[this.backboneTabIndex].image;
            },
        },
        methods: {
            addViewer(imageId, id = uuid()) {
                if (this.viewers.length < this.nbMaxViewers && imageId !== "") {
                    this.viewers.push({
                        id,
                        imageId,
                        linkedTo: [],
                        data: this.images[this.imageIndex(imageId)],
                        imageGroup: "", //TODO: remove
                        projectConfig: this.projectConfig, //TODO: remove
                        user: this.currentUser, //TODO: remove
                    })
                }
                this.updateOpenLayersMapsSize();
            },
            deleteViewer(viewerId) {
                let index = this.viewers.findIndex(map => {
                    return map.id === viewerId;
                });
                this.viewers.splice(index, 1);
                this.updateOpenLayersMapsSize();
            },
            updateOpenLayersMapsSize() {
                this.viewers.forEach(map => {
                    this.$openlayers.getMap(map.id).updateSize();
                })
            },
            imageIndex(imageId) {
                return this.images.findIndex(image => image.id == imageId);
            },




            viewerIndex(mapId) {
                return this.viewers.findIndex(map => map.id == mapId)
            },
            setMap(payload) {
                this.mapView = {
                    mapCenter: payload.view.getCenter(),
                    mapResolution: payload.view.getResolution(),
                    mapRotation: payload.view.getRotation(),
                };
                this.lastEventMapId = payload.mapId;
                this.$openlayers.getMap(payload.mapId).updateSize();
            },
            linkMaps(payload) {
                // Finds map index
                let index = this.viewerIndex(payload.sender);

                let isRemoving = this.viewers[index].linkedTo.findIndex(link => link == payload.modifiedValue) >= 0;

                // Links maps
                this.viewers[index].linkedTo = payload.newLinks;

                if (isRemoving) {
                    index = this.viewerIndex(payload.modifiedValue);
                    let linkToDeleteIndex = this.viewers[index].linkedTo.findIndex(link => link == payload.sender);
                    this.viewers[index].linkedTo.splice(linkToDeleteIndex, 1);
                } else {
                    index = this.viewerIndex(payload.modifiedValue);
                    this.viewers[index].linkedTo.push(payload.sender);
                }
            },


            updateMap(payload) {
                let index = this.viewers.findIndex(map => map == payload.old);
                this.viewers[index].data = payload.new;
                this.viewers[index].imageId = payload.new.id;
            },

            checkRoute() {
                // DEPENDS ON [BACKBONE]
                this.currentRoute = Backbone.history.getFragment();
            },
        },
        created() {
            api.get(`api/project/${this.projectId}.json`).then(response => {
                this.project = response.data;
                api.get(`api/project/${this.projectId}/user.json`).then(response => {
                    this.project.users = response.data.collection;
                });
                api.get(`api/project/${this.projectId}/admin.json`).then(response => {
                    this.project.admins = response.data.collection;
                });

                api.get(`api/project/${this.projectId}/imagefilterproject.json`).then(response => {
                    this.filters = response.data.collection;
                });

                api.get(`api/project/${this.projectId}/imagegroup.json`).then(response => {
                    this.imageGroups = response.data.collection;
                });

                api.get(`/api/project/${this.projectId}/online/user.json`).then(response => {
                    this.onlineUsers = response.data.collection;
                });
            });

            api.get(`/custom-ui/config.json?project=${this.projectId}`).then(response => {
                this.projectConfig = response.data;
                api.get(`api/project/${this.projectId}/imageinstance.json`).then(response => {
                    let id = uuid();
                    this.lastEventMapId = id;
                    this.images = response.data.collection;
                    api.get(`api/user/current.json`).then(response => {
                        this.currentUser = response.data;
                        this.addViewer(this.baseImage, id); //TODO
                    })
                })
            });



            // DEPENDS ON [BACKBONE]
            setInterval(this.checkRoute, 1000)
        },
    }
</script>

<style>
    .maps-container {
        display: flex;
        flex-wrap: wrap;
    }
</style>

