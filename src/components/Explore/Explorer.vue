<template>
    <div>
        <div class="explorer-header" ref="explorerHeader">
            <viewer-selector :project="project"
                             :images="images"
                             :nb-viewers="viewers.length"
                             :nb-max-viewers="nbMaxViewers"
                             @add-viewer="addViewer"></viewer-selector>
        </div>

        <div class="maps-container" :style="`height: calc(100vh - ${paddingTop}px);`">
            <viewer v-for="viewer in viewers" :key="viewer.id" :currentRoute="currentRoute"
                    :project="project" :project-config="projectConfig" :filters="filters" :image-groups="imageGroups"
                    :current-user="currentUser" :viewers="viewers" v-bind="viewer" :padding-top="paddingTop"
                    :ontology="ontology" @deleteViewer="deleteViewer" @linkViewers="linkViewers"
                    @changeImage="changeImage" @current-map="viewer" @updateImage="updateImage"
                    :lastEventMapId="lastEventMapId" @setCurrentViewer="setCurrentViewer"
                    :linked-viewers-bus="linkedViewersBus" :point-radius="pointRadius"></viewer>
        </div>
    </div>
</template>

<script>
    import Viewer from './Viewer'
    import ViewerSelector from "./ViewerSelector";

    import Vue from 'vue'
    import uuid from 'uuid'
    import hexToRgb from "../../helpers/hexToRgb";

    export default {
        name: 'Explorer',
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
                ontology: {
                    id: 0,
                    name: "",
                    allTerms: [],
                    children: []
                },
                lastEventMapId: null,
                linkedViewersBus: new Vue(),
                currentRoute: '',
                pointRadius: 8,

                navbarHeight: 50,
                explorerTabHeight: 42,
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
            explorerHeaderHeight() {
                return (this.$refs.explorerHeight) ? this.$refs.explorerHeader.clientHeight : 40;
            },
            paddingTop() {
                return this.navbarHeight + this.explorerTabHeight + this.explorerHeaderHeight
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
                    api.get(`api/imageinstance/${imageId}.json`).then(response => {
                        this.lastEventMapId = id;
                        this.viewers.push({
                            id,
                            imageId,
                            linkedTo: [],
                            image: response.data,
                        })
                    });
                }
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
                let newIndex = (index == this.viewers.length) ? index - 1 : index;
                this.lastEventMapId = this.viewers[newIndex].id
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
            updateImage(newImage) {
                this.viewers.forEach(viewer => {
                    if (viewer.image.id == newImage.id) {
                        viewer.image = newImage;
                        this.images[this.imageIndex(newImage.id)] = newImage;
                    }
                })
            },
            setCurrentViewer(viewerId) {
                this.lastEventMapId = viewerId;
            },
            checkRoute() {
                // DEPENDS ON [BACKBONE]
                this.currentRoute = Backbone.history.getFragment();
            },
            getNavbarHeight() {
                this.navbarHeight = document.getElementById("navbar-header").offsetHeight;
            },
            getExplorerTabHeight() {
                this.explorerTabHeight = document.getElementById("explorer-tab").offsetHeight;
            },
        },
        watch: {
            explorerTabHeight(newValue) {
                document.getElementById("explorer-tab-content").style.paddingTop = newValue + 'px';
            }
        },
        created() {
            api.get(`api/user/current.json`).then(response => {
                this.currentUser = response.data;
            });

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
                                group.times = response.data.time;
                            }

                            api.get(`/api/imagegroup/${group.id}/imagegroupHDF5.json`).then(response => {
                                group.hdf5 = response.data;
                                this.imageGroups.push(group);
                            }).catch(errors => {
                                group.hdf5 = undefined;
                                this.imageGroups.push(group);
                            })
                        });
                    });
                });

                api.get(`/custom-ui/config.json?project=${this.projectId}`).then(response => {
                    this.projectConfig = response.data;
                });

                api.get(`api/project/${this.projectId}/imageinstance.json`).then(response => {
                    this.images = response.data.collection;
                    this.addViewer(this.baseImage);
                });

                api.get(`/api/project/${this.projectId}/online/user.json`).then(response => {
                    this.onlineUsers = response.data.collection;
                });

                api.get(`api/ontology/${this.project.ontology}.json`).then(response => {
                    this.ontology = response.data;

                    let getTerms = (children) => {
                        let terms = [];
                        children.forEach(child => {
                            child.colorRGB = hexToRgb(child.color);
                            terms.push(child);
                            terms = terms.concat(getTerms(child.children))
                        });
                        return terms;
                    };
                    this.ontology.allTerms = getTerms(this.ontology.children);
                })
            });

            // DEPENDS ON [BACKBONE]
            setInterval(this.checkRoute.bind(this), 1000)
        },
        mounted() {
            this.pointRadius = localStorage.getItem(`point_radius${this.project.id}`) || 8;

            this.getNavbarHeight();
            this.getExplorerTabHeight();

            this.$nextTick(function () {
                window.addEventListener('resize', this.getNavbarHeight);
                window.addEventListener('resize', this.getExplorerTabHeight);
            });
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.getNavbarHeight);
            window.removeEventListener('resize', this.getExplorerTabHeight);
        }
    }
</script>

<style>
    .maps-container {
        display: flex;
        flex-wrap: wrap;
    }

    .alert {
        z-index: 1010;
    }
</style>

