<template>
    <div>
        <div v-if="maps.length < maxMapsToShow">
            <template>
                <select class="btn" v-model.number="imageToAdd" name="images" id="images">
                    <option value="">Select an image to add</option>
                    <option v-for="image in images" :key="image.id" :value="image.id">
                        {{getInstanceFilename(image)}}
                    </option>
                </select>
                <button class="btn" @click="addMap(imageToAdd)">Add a view</button>
            </template>
        </div>
        <p v-else>You can only have {{maxMapsToShow}} views displayed in an explorer tab.</p>
        <div class="maps-container" :style="`height: calc(100vh - ${paddingTop}px);`">
            <explore v-for="map in maps" :currentRoute="currentRoute" :key="map.id" @updateMap="updateMap"
                     @dragged="setMap" @mapIsLinked="linkMaps" @deleteMap="deleteMap"
                     :mapView="mapView" :maps='maps' :currentMap="map"
                     :lastEventMapId="lastEventMapId" :filters="filters" :imageGroups="imageGroups"
                     :padding-top="paddingTop" :project="project" :currentUser="currentUser"></explore>
        </div>
    </div>
</template>

<script>
    import Explore from '../../components/Explore/Explore'

    import uuid from 'uuid'

    export default {
        name: 'app',
        components: {
            Explore,
        },
        data() {
            return {
                mapView: {
                    mapCenter: [0, 0],
                    mapZoom: 2,
                    mapRotation: 0,
                },
                maxMapsToShow: 4,
                maps: [],
                lastEventMapId: null,
                imageToAdd: "",

                project: {},
                projectConfig: {},
                images: [],
                filters: [],
                imageGroups: [],
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
            addMap(imageId = this.imageToAdd, id = uuid()) {
                if (this.maps.length < this.maxMapsToShow && imageId !== "") {
                    this.maps.push({
                        id,
                        imageId,
                        linkedTo: [],
                        imageGroup: "",
                        projectConfig: this.projectConfig,
                        user: this.currentUser,
                        data: this.images[this.imageIndex(imageId)]
                    })
                }

                this.updateMapsSize();
            },
            deleteMap(payload) {
                let index = this.maps.findIndex(map => {
                    return map.id === payload;
                });
                this.maps.splice(index, 1);
                this.updateMapsSize();
            },
            updateMapsSize() {
              this.maps.forEach(map => {
                  this.$openlayers.getMap(map.id).updateSize();
              })
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
            },
            getInstanceFilename(image) {
                if (this.project.blindMode)
                    return `[BLIND] ${image.id}`;
                return image.instanceFilename
            },
        },
        created() {
            api.get(`api/project/${this.projectId}.json`).then(data => {
                this.project = data.data;
                api.get(`api/project/${this.projectId}/user.json`).then(data => {
                    this.project.users = data.data.collection;
                });
                api.get(`api/project/${this.projectId}/admin.json`).then(data => {
                    this.project.admins = data.data.collection;
                });
            });

            api.get(`/custom-ui/config.json?project=${this.projectId}`).then(data => {
                this.projectConfig = data.data;
                api.get(`api/project/${this.projectId}/imageinstance.json`).then(data => {
                    let id = uuid();
                    this.lastEventMapId = id;
                    this.images = data.data.collection;
                    api.get(`api/user/current.json`).then(data => {
                        this.currentUser = data.data;
                        this.addMap(this.baseImage, id);
                    })
                })
            });

            api.get(`api/project/${this.projectId}/imagefilterproject.json`).then(data => {
                this.filters = data.data.collection;
            });

            api.get(`api/project/${this.projectId}/imagegroup.json`).then(data => {
                this.imageGroups = data.data.collection;
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

