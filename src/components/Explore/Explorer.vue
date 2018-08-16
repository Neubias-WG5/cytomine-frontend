<template>
    <div>
        <div class="explorer-header">
            <viewer-selector :project="project" :images="images" :nb-viewers="viewers.length"
                             :nb-max-viewers="nbMaxViewers" @add-viewer="addViewer"></viewer-selector>
        </div>

        <div class="maps-container" :style="`height: calc(100vh - ${paddingTop}px);`">
            <viewer v-for="viewer in viewers" :key="viewer.id" :currentRoute="currentRoute"
                    :project="project" :project-config="projectConfig" :filters="filters" :image-groups="imageGroups"
                    :current-user="currentUser" :viewers="viewers" v-bind="viewer" :padding-top="paddingTop"
                    :ontology="ontology" @deleteViewer="deleteViewer" @linkViewers="linkViewers"
                    @changeImage="changeImage" @dragged="setMap" @current-map="viewer"
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
                ontology: {},

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
            imageIndex(imageId) {
                return this.images.findIndex(image => image.id == imageId);
            },
            viewerIndex(viewerId) {
                return this.viewers.findIndex(viewer => viewer.id == viewerId)
            },
            addViewer(imageId, id = uuid()) {
                if (this.viewers.length < this.nbMaxViewers && imageId !== "") {
                    this.viewers.push({
                        id,
                        imageId,
                        linkedTo: [],
                        image: this.images[this.imageIndex(imageId)],
                    })
                }
                this.updateOpenLayersMapsSize();
            },
            deleteViewer(viewerId) {
                let index = this.viewerIndex(viewerId);
                this.viewers.splice(index, 1);

                // Delete the viewer in other viewers linkedTo lists.
                this.viewers.forEach(viewer => {
                   viewer.linkedTo = viewer.linkedTo.filter(v => {
                       return v != viewerId;
                   })
                });
                this.updateOpenLayersMapsSize();
            },
            linkViewers(payload) {
                let viewerIndex = this.viewerIndex(payload.sender);
                let isRemoving = this.viewers[viewerIndex].linkedTo.findIndex(viewer => viewer == payload.modifiedValue) >= 0;
                this.viewers[viewerIndex].linkedTo = payload.newLinks;
                if (isRemoving) {
                    viewerIndex = this.viewerIndex(payload.modifiedValue);
                    let linkToDeleteIndex = this.viewers[viewerIndex].linkedTo.findIndex(viewer => viewer == payload.sender);
                    this.viewers[viewerIndex].linkedTo.splice(linkToDeleteIndex, 1);
                } else {
                    viewerIndex = this.viewerIndex(payload.modifiedValue);
                    this.viewers[viewerIndex].linkedTo.push(payload.sender);
                }
            },
            changeImage(payload) {
                let index = this.viewerIndex(payload.viewerId);
                this.viewers[index].image = this.images[this.imageIndex(payload.newImageId)];
            },


            updateOpenLayersMapsSize() {
                this.viewers.forEach(map => {
                    this.$openlayers.getMap(map.id).updateSize();
                })
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
                    let groups = response.data.collection;
                    groups.forEach(group => {
                        api.get(`/api/imagegroup/${group.id}/characteristics.json`).then(response => {
                            if (response.data.channel) {
                                group.channels = response.data.channel;
                                group.zStacks = response.data.zStack;
                                group.times =  response.data.time;
                            }

                            api.get(`/api/imagegroup/${group.id}/imagegroupHDF5.json`).then(response => {
                                this.hdf5 = response.data;
                                this.imageGroups.push(group);
                            }).catch(errors => {
                                this.hdf5 = undefined;
                                this.imageGroups.push(group);
                            })
                        });
                    });
                });

                api.get(`/api/project/${this.projectId}/online/user.json`).then(response => {
                    this.onlineUsers = response.data.collection;
                });

                api.get(`api/ontology/${this.project.ontology}.json`).then(response => {
                    this.ontology = response.data;
                })
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

