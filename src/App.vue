<template>
    <div>
        <div v-if="maps.length < maxMapsToShow">
            <template v-if="imageGroupIndex[0]">
                <select class="btn" v-model.number="imageGroupToAdd" name="image-groups" id="image-groups">
                    <option value="">Select an imagegroup</option>
                    <option v-for="imageGroup in imageGroupIndex" :key="imageGroup.id" :value="imageGroup.id">
                        {{imageGroup.name}}
                    </option>
                </select>
                <button class="btn" @click="addImageGroup()">Add image group</button>
            </template>
            <template>
                <select class="btn" v-model.number="imageToAdd" name="images" id="images">
                    <option value="">Select an image to add</option>
                    <option v-for="image in images" :key="image.id" :value="image.id">{{image.instanceFilename}}
                    </option>
                </select>
                <button class="btn" @click="addMap(imageToAdd)">Add a map</button>
            </template>
        </div>
        <p v-else>You can only have {{maxMapsToShow}} maps displayed</p>
        <overview-map :lastEventMapId="lastEventMapId" :maps="maps"></overview-map>
        <div class="maps-container" :style="`height: calc(100vh - ${paddingTop}px);`">
            <explore v-for="map in maps" :currentRoute="currentRoute" :key="map.id" @updateMap="updateMap"
                     @dragged="setMap" @mapIsLinked="linkMaps" @deleteMap="deleteMap"
                     @updateOverviewMap="updateOverviewMap" :mapView="mapView" :maps='maps' :currentMap="map"
                     :lastEventMapId="lastEventMapId" :filters="filters" :imageGroupIndex="imageGroupIndex"
                     :padding-top="paddingTop" :project="project"></explore>
        </div>
    </div>
</template>

<script>
    import Explore from './components/Explore'
    import OverviewMap from './components/OverviewMap'

    import uuid from 'uuid'

    export default {
        name: 'app',
        components: {
            Explore,
            OverviewMap
        },
        data() {
            return {
                projectConfig: {},
                mapView: {
                    mapCenter: [0, 0],
                    mapZoom: 2,
                    mapRotation: 0,
                },
                maxMapsToShow: 4,
                maps: [],
                lastEventMapId: null,
                project: {},
                images: [],
                imageToAdd: "",
                imageGroupToAdd: "",
                filters: [],
                imageGroupIndex: [],
                imageSequences: [],
                baseSequence: {},
                onlineUsers: [],
                currentUser: {},
                currentRoute: '',
                paddingTop: 50 + 42 + 34,
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
            mapIndex(mapId) {
                return this.maps.findIndex(map => map.id == mapId)
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
                let index = this.mapIndex(payload.sender);

                let isRemoving = this.maps[index].linkedTo.findIndex(link => link == payload.modifiedValue) >= 0;

                // Links maps
                this.maps[index].linkedTo = payload.newLinks;

                if (isRemoving) {
                    index = this.mapIndex(payload.modifiedValue);
                    let linkToDeleteIndex = this.maps[index].linkedTo.findIndex(link => link == payload.sender);
                    this.maps[index].linkedTo.splice(linkToDeleteIndex, 1);
                } else {
                    index = this.mapIndex(payload.modifiedValue);
                    this.maps[index].linkedTo.push(payload.sender);
                }
            },
            addMap(imageId = this.imageToAdd, imageGroup = "", id = uuid()) {
                if (this.maps.length < this.maxMapsToShow && imageId !== "") {
                    this.maps.push({
                        id,
                        imageId,
                        linkedTo: [],
                        imageGroup,
                        projectConfig: this.projectConfig,
                        user: this.currentUser,
                        data: this.images[this.imageIndex(imageId)]
                    })
                }
            },
            addImageGroup() {
                if (this.imageGroupToAdd !== "") {
                    api.get(`/api/imagegroup/${this.imageGroupToAdd}/imagesequence.json`).then(data => {
                        this.imageSequences = data.data.collection;
                        this.addMap(this.imageSequences[0].image, this.imageGroupToAdd);
                    })
                }
            },
            deleteMap(payload) {
                let index = this.maps.findIndex(map => {
                    return map.id === payload;
                });
                this.maps.splice(index, 1);
            },
            updateOverviewMap() {
                this.lastEventMapId = 'reload';
            },
            updateMap(payload) {
                let index = this.maps.findIndex(map => map == payload.old);
                this.maps[index].data = payload.new;
                this.maps[index].imageId = payload.new.id;
            },
            ping() {
                api.post(`server/ping.json`, {project: this.projectId});
            },
            checkRoute() {
                // DEPENDS ON [BACKBONE]
                this.currentRoute = Backbone.history.getFragment();
            }
        },
        created() {
            api.get(`api/project/${this.projectId}.json`).then(data => {
                this.project = data.data;
            });

            api.get(`api/project/${this.projectId}/imagegroup.json`).then(data => {
                this.imageGroupIndex = data.data.collection;
            });

            api.get(`/custom-ui/config.json?project=${this.projectId}`).then(data => {
                this.projectConfig = data.data;
                api.get(`api/project/${this.projectId}/imageinstance.json`).then(data => {
                    let id = uuid();
                    this.lastEventMapId = id;
                    this.images = data.data.collection;
                    api.get(`api/user/current.json`).then(data => {
                        this.currentUser = data.data;
                        if (this.imageGroupIndex[0]) {
                            api.get(`/api/imageinstance/${this.baseImage}/imagesequence.json`).then(resp => {
                                this.baseSequence = resp.data.collection[0];
                                if (this.baseSequence) {
                                    this.addMap(this.baseImage, this.baseSequence.imageGroup, id);
                                } else {
                                    this.addMap(this.baseImage, "", id);
                                }
                            })
                        } else {
                            this.addMap(this.baseImage, "", id);
                        }
                    })
                })
            });


            api.get(`api/project/${this.projectId}/imagefilterproject.json`).then(data => {
                this.filters = data.data.collection;
            });

            api.get(`/api/project/${this.projectId}/online/user.json`).then(data => {
                this.onlineUsers = data.data.collection;
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

