<template>
    <div class="cytomine-container">
        <div class="add-new">
            <button class="btn btn-primary" @click="add()" v-if="!isGuest"><i class="fa fa-plus"></i> Add new image group</button>
            <button class="btn btn-primary" @click="loadData()"><i class="fas fa-sync-alt"></i> Refresh</button>

            <button :class="['btn', 'btn-default']" @click="showLabel=!showLabel">
                <template v-if="!showLabel">Show</template>
                <template v-else>Hide</template> labeled images
            </button>
        </div>
        <table class="table table-striped table-bordered">
            <thead>
            <tr>
                <th>#</th>
                <th>Preview</th>
                <th>Name</th>
                <th>Channel (c)</th>
                <th>Slice (z)</th>
                <th>Time (t)</th>
                <!--<th>Spectral distribution (HDF5)</th>-->
                <th>Action(s)</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="imageGroup in sortedImageGroups" :key="imageGroup.id">
                <td>{{imageGroup.id}}</td>
                <td>
                    <div style='width : 130px;' v-if="imageGroup.thumb && hasAtLeastOneImage(imageGroup)">
                        <a :href="`#tabs-imagegroup-${project.id}-${imageGroup.id}`">
                            <img :src="imageGroup.thumb" alt="originalFilename" style="max-height : 45px;max-width : 128px;"/>
                        </a>
                    </div>
                </td>
                <td>{{imageGroup.name}}</td>
                <td>{{prettyPrintDimensions(imageGroup.channels)}}</td>
                <td>{{prettyPrintDimensions(imageGroup.zStacks)}}</td>
                <td>{{prettyPrintDimensions(imageGroup.times)}}</td>
                <!--<td>-->
                    <!--<span class="label label-success" v-if="imageGroup.hdf5 && imageGroup.hdf5.status == 3">Available</span>-->
                    <!--<span class="label label-warning" v-else-if="imageGroup.hdf5 && imageGroup.hdf5.status == 2">In conversion ({{imageGroup.hdf5.progress}}%)</span>-->
                    <!--<span class="label label-danger" v-else-if="imageGroup.hdf5 && imageGroup.hdf5.status == 4">Failed</span>-->
                    <!--<span class="label label-default" v-else-if="imageGroup.hdf5 && imageGroup.hdf5.status == 0">Waiting</span>-->
                    <!--<span class="label label-info" v-else-if="isHDF5Convertable(imageGroup)">Convertable</span>-->
                    <!--<span class="label label-default" v-else>Unavailable</span>-->
                <!--</td>-->
                <td style="min-width: 130px;">
                    <dropdown>
                        <a role="button" :class="['btn', 'btn-info', 'btn-xs', {disabled: !hasAtLeastOneImage(imageGroup)}]"
                           :href="`#tabs-imagegroup-${project.id}-${imageGroup.id}`"><i class="fas fa-eye"></i> Explore</a>
                        <button class="btn btn-info btn-xs dropdown-toggle"><span class="caret"></span></button>
                        <template slot="dropdown">
                            <li>
                                <a :href="`api/imagegroup/${imageGroup.id}/download`" role="button" style="cursor:pointer;">
                                    <i class="fas fa-file-download"></i> Download
                                </a>
                            </li>
                            <!--<li v-if="isHDF5Convertable(imageGroup)">-->
                                <!--<a role="button" style="cursor: pointer;" @click="convert(imageGroup)">-->
                                    <!--<i class="fas fa-file-archive"></i> Convert to HDF5-->
                                <!--</a>-->
                            <!--</li>-->
                            <!--<li role="separator" class="divider" v-if="isHDF5Convertable(imageGroup)"></li>-->
                            <li v-if="!isGuest">
                                <a role="button" style="cursor: pointer;" @click="editSequences(imageGroup)">
                                    <i class="fas fa-images"></i> Manage sequences
                                </a>
                            </li>
                            <li v-if="!isGuest">
                                <a role="button" style="cursor: pointer;" @click="edit(imageGroup)">
                                    <i class="fas fa-edit"></i> Rename
                                </a>
                            </li>
                            <li v-if="!isGuest">
                                <a role="button" style="cursor: pointer;" @click="remove(imageGroup)">
                                    <i class="fas fa-trash-alt"></i> Delete
                                </a>
                            </li>

                        </template>
                    </dropdown>
                </td>
            </tr>
            <tr v-if="sortedImageGroups.length == 0">
                <td colspan="8" class="text-center">No image group.</td>
            </tr>
            </tbody>
        </table>
        <image-group-edit-modal :open.sync="openModal" :group.sync="currentImageGroup" @updateList="loadData" :project="project"></image-group-edit-modal>
        <image-sequences-edit-modal :open.sync="openModalSequences" :group.sync="currentImageGroup" @updateList="loadData"></image-sequences-edit-modal>
    </div>

</template>

<script>
    import {Dropdown} from 'uiv'
    import ImageGroupEditModal from "./ImageGroupEditModal";
    import ImageSequencesEditModal from "./ImageSequencesEditModal";

    export default {
        name: "ImageGroupList",
        components: {
            ImageSequencesEditModal,
            ImageGroupEditModal,
            Dropdown
        },
        data() {
            return {
                project: {},
                imageGroups: [],
                currentImageGroup: null,
                openModal: false,
                openModalSequences: false,
                timers: {},
                showLabel: false
            }
        },
        computed: {
            isGuest() {
                // DEPENDS ON [BACKBONE]
                return window.app.status.user.model.get('guest');
            },
            projectId() {
                // DEPENDS ON [BACKBONE]
                return window.app.status.currentProject;
            },
            sortedImageGroups() {
                if (!this.imageGroups)
                    return [];

                return this.imageGroups.sort((a, b) => {
                    return b.id - a.id
                })
            }
        },
        watch: {
            showLabel() {
                this.loadData();
            }
        },
        methods: {
            add() {
                this.currentImageGroup = null;
                this.openModal = true;
            },
            edit(group) {
                this.currentImageGroup = group;
                this.openModal = true;
            },
            editSequences(group) {
                this.currentImageGroup = group;
                this.openModalSequences = true;
            },
            convert(group) {
                this.$confirm({
                    title: 'Confirm',
                    okType: 'info',
                    okText: 'Launch conversion',
                    content: `This image group #${group.id} will be converted to HDF5. It allows to retrieve spectral distribution from pixels or group of pixels. Depending on data, it can be a slow and costly operation. Continue?`
                }).then(() => {
                    api.post(`api/imagegroupHDF5.json`, {group: group.id}).then(response => {
                        this.loadData();
                        group.hdf5 = response.data.imagegrouphdf5;
                        this.makeTimer(group);
                        this.$notify({
                            placement: 'bottom-right',
                            type: 'success',
                            content: response.data.message
                        });
                    }).catch(error => {
                        this.$notify({
                            placement: 'bottom-right',
                            type: 'danger',
                            content: error.response.data.errors
                        });
                    })
                }).catch(() => {
                    this.$notify({
                        placement: 'bottom-right',
                        content: 'Conversion operation aborted.'
                    });
                })
            },
            remove(group) {
                this.$confirm({
                    title: 'Confirm',
                    okType: 'danger',
                    okText: 'Delete',
                    content: `This image group #${group.id} will be permanently deleted. Continue?`
                }).then(() => {
                    api.delete(`api/imagegroup/${group.id}.json`).then(response => {
                        this.loadData();
                        this.$notify({
                            placement: 'bottom-right',
                            type: 'success',
                            content: response.data.message
                        });
                    }).catch(error => {
                        this.$notify({
                            placement: 'bottom-right',
                            type: 'danger',
                            content: error.response.data.errors
                        });
                    })
                }).catch(() => {
                    this.$notify({
                        placement: 'bottom-right',
                        content: 'Delete operation aborted.'
                    });
                })
            },
            isHDF5Convertable(imageGroup) {
                let c = imageGroup.channels.length;
                let t = imageGroup.times.length;
                let z = imageGroup.zStacks.length;
                return !imageGroup.hdf5 && ((c > 1 && t == 1 && z == 1) || (t > 1 && c == 1 && z == 1) || (z > 1 && c == 1 && t == 1))
            },
            hasAtLeastOneImage(imageGroup) {
                let c = imageGroup.channels.length;
                let t = imageGroup.times.length;
                let z = imageGroup.zStacks.length;
                return c + t + z > 0
            },
            prettyPrintDimensions(array) {
                if (array.length === 0) {
                    return "[]";
                }
                let ini = array[0];
                let result = "[" + ini;

                let nbConsecutiveValues = 0;
                for (let i = 1; i < array.length; ++i) {
                    if (array[i] === ini + 1) {
                        nbConsecutiveValues++;
                        ini++;
                    }
                    else {
                        if (nbConsecutiveValues == 0)
                            result += ", " + array[i];
                        else {
                            nbConsecutiveValues = 0;
                            result += ".." + ini + ", " + array[i];
                        }
                        ini = array[i];
                    }
                }
                if (nbConsecutiveValues != 0)
                    result += ".." + array[array.length - 1] + "]";
                else
                    result += "]";

                return result;
            },
            loadData() {
                // api.get(`api/user/current.json`).then(response => {
                //     this.currentUser = response.data;
                // });

                api.get(`api/project/${this.projectId}.json`).then(response => {
                    this.project = response.data;
                    api.get(`api/project/${this.projectId}/user.json`).then(response => {
                        this.project.users = response.data.collection;
                    });
                    api.get(`api/project/${this.projectId}/admin.json`).then(response => {
                        this.project.admins = response.data.collection;
                    });

                    let label = (!this.showLabel) ? '?withoutLabel=true' : '';
                    api.get(`api/project/${this.projectId}/imagegroup.json${label}`).then(response => {
                        this.imageGroups.splice(0, this.imageGroups.length);
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
                                    if (group.hdf5.status <= 2) this.makeTimer(group);
                                    this.imageGroups.push(group);
                                }).catch(errors => {
                                    group.hdf5 = undefined;
                                    this.imageGroups.push(group);
                                })
                            });
                        });
                    });

                    // api.get(`/custom-ui/config.json?project=${this.projectId}`).then(response => {
                    //     this.projectConfig = response.data;
                    // });
                    //
                    // api.get(`api/project/${this.projectId}/imageinstance.json`).then(response => {
                    //     this.images = response.data.collection;
                    // });
                });
            },
            makeTimer(group) {
                let c = (group.channels.length > 0) ? group.channels[0] : 0;
                let z = (group.zStacks.length > 0) ? group.zStacks[0] : 0;
                let t = (group.times.length > 0) ? group.times[0] : 0;
                api.get(`api/imagegroup/${group.id}/${c}/${z}/0/${t}/imagesequence.json`).then(response => {
                    let v = response.data.width * response.data.height * Math.max(1, group.channels.length)
                        * Math.max(1, group.zStacks.length) * Math.max(1, group.times.length);
                    let timeout = (v > 100 * 1000 * 1000) ? 120000 : 5000;
                    let func = function()  {
                        api.get(`api/imagegroupHDF5/${group.hdf5.id}.json`).then(response => {
                            let index = this.imageGroups.findIndex(g => g.id == group.id);
                            let g = this.imageGroups[index];
                            g.hdf5 = response.data;
                            this.imageGroups.splice(index, 1, g);


                            if (g.hdf5.status > 2) {
                                clearInterval(this.timers[g.id])
                                this.timers[g.id] = null;
                            }
                        })
                    };
                    if (this.timers[group.id]) clearInterval(this.timers[group.id]);
                    this.timers[group.id] = setInterval(func.bind(this), timeout);
                })
            }
        },
        created() {
            this.loadData();
        },
        beforeDestroy() {
            Object.keys(this.timers).map(key => {
                clearInterval(this.timers[key]);
            })
        }
    }
</script>

<style scoped>
    .cytomine-container {
        width: 90%;
        margin: auto;
    }

    .add-new {
        text-align: center;
        margin: 5px;
    }
</style>
