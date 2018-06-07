<template>
    <div>
        <div class="toolbar-annotations btn-toolbar" role="toolbar">
            <div class="btn-group" role="group">
                <template v-if="mustBeShown('project-tools-select')">
                    <button :class="['btn', 'btn-default', 'btn-xs', {active: draw.activeTool == 'Select'}]"
                            @click="addInteraction('Select')" title="Select an annotation">
                        <span class="glyphicon glyphicon-move" aria-hidden="true"></span>
                        Select
                    </button>
                </template>
                <template v-if="mustBeShown('project-tools-point')">
                    <button :class="['btn', 'btn-default', 'btn-xs', {active: draw.activeTool == 'Point'}]"
                            @click="addInteraction('Point')" title="Add a point as new annotation">
                        <span class="glyphicon glyphicon-map-marker" aria-hidden="true"></span>
                        Point
                    </button>
                </template>
                <template v-if="mustBeShown('project-tools-line')">
                    <button :class="['btn', 'btn-default', 'btn-xs', {active: draw.activeTool == 'Line'}]"
                            @click="addInteraction('Line')" title="Add a line as new annotation">
                        <span class="glyphicon glyphicon-minus" aria-hidden="true"></span>
                        Line
                    </button>
                </template>
                <template v-if="mustBeShown('project-tools-arrow')">
                    <button :class="['btn', 'btn-default', 'btn-xs', {active: draw.activeTool == 'Arrow'}]"
                            @click="addInteraction('Arrow')" title="Add an arrow as new annotation">
                        <span class="glyphicon glyphicon-arrow-up" aria-hidden="true"></span>
                        Arrow
                    </button>
                </template>
                <template v-if="mustBeShown('project-tools-rectangle')">
                    <button :class="['btn', 'btn-default', 'btn-xs', {active: draw.activeTool == 'Rectangle'}]"
                            @click="addInteraction('Rectangle')" title="Add a rectangle as new annotation">
                        <span class="glyphicon glyphicon-stop"></span>
                        Rectangle
                    </button>
                </template>
                <template v-if="mustBeShown('project-tools-diamond')">
                    <button :class="['btn', 'btn-default', 'btn-xs', {active: draw.activeTool == 'Ellipse'}]"
                            @click="addInteraction('Ellipse')" title="Add an ellipse as new annotation">
                        Ellipse
                    </button>
                </template>
                <template v-if="mustBeShown('project-tools-circle')">
                    <button :class="['btn', 'btn-default', 'btn-xs', {active: draw.activeTool == 'Circle'}]"
                            @click="addInteraction('Circle')" title="Add a circle as new annotation">
                        Circle
                    </button>
                </template>
                <template v-if="mustBeShown('project-tools-polygon')">
                    <button :class="['btn', 'btn-default', 'btn-xs', {active: draw.activeTool == 'Polygon'}]"
                            @click="addInteraction('Polygon')" title="Add a polygon as new annotation">
                        <span class="glyphicon glyphicon-play"></span>
                        Polygon
                    </button>
                </template>
                <!-- <template v-if="mustBeShown('project-tools-magicwand')"> TODO MAGICWAND
                    <button :class="['btn', 'btn-default', 'btn-xs', {active: draw.activeTool == 'MagicWand'}]" @click="addInteraction('MagicWand')" title="Add a new annotation with magic wand">
                        MagicWand
                    </button>
                </template> -->
                <template v-if="mustBeShown('project-tools-freehand')">
                    <button :class="['btn', 'btn-default', 'btn-xs', {active: draw.activeTool == 'Freehand'}]"
                            @click="addInteraction('Polygon', true)" title="Add a new annotation with freehand draw">
                        <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>
                        Freehand
                    </button>
                </template>
                <template v-if="mustBeShown('project-tools-union')">
                    <button :class="['btn', 'btn-default', 'btn-xs', {active: draw.activeTool == 'Union'}]"
                            @click="addInteraction('Correction', true)" title="Correct an annotation by adding a freehand area">
                        <span class="glyphicon glyphicon-plus" aria-hidden="true"></span>
                        <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>
                    </button>
                </template>
                <template v-if="mustBeShown('project-tools-difference')">
                    <button :class="['btn', 'btn-default', 'btn-xs', {active: draw.activeTool == 'Difference'}]"
                            @click="addInteraction('Correction', true, true)" title="Correct an annotation by removing a freehand area">
                        <span class="glyphicon glyphicon-minus" aria-hidden="true"></span>
                        <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>
                    </button>
                </template>
                <template v-if="mustBeShown('project-tools-rule')">
                    <button :class="['btn', 'btn-default', 'btn-xs', {active: draw.activeTool == 'Ruler'}]"
                            @click="addInteraction('Ruler')" title="Measure with a ruler">
                        Ruler
                    </button>
                </template>
            </div>
            <template v-if="featureSelected.getArray()[0]">
                <div class="btn-group" role="group">
                    <template v-if="mustBeShown('project-tools-fill') && featureSelected.getArray()[0].getGeometry().getType() != 'Point'
                    && featureSelected.getArray()[0].getGeometry().getType() != 'LineString' ">
                        <button :class="['btn', 'btn-default', 'btn-xs', {active: draw.activeTool == 'Fill'}]"
                                @click="addInteraction('Fill')" title="Fill holes in the selected annotation">
                            Fill
                        </button>
                    </template>
                    <template v-if="mustBeShown('project-tools-edit') && featureSelected.getArray()[0].getGeometry().getType() != 'Point'">
                        <button :class="['btn', 'btn-default', 'btn-xs', {active: draw.activeTool == 'Edit'}]"
                                @click="addInteraction('Edit')" title="Edit geometry of the selected annotation">
                            <span class="glyphicon glyphicon-edit" aria-hidden="true"></span>
                            Edit
                        </button>
                    </template>
                    <template v-if="mustBeShown('project-tools-rotate') && featureSelected.getArray()[0].getGeometry().getType() != 'Point'">
                        <button :class="['btn', 'btn-default', 'btn-xs', {active: draw.activeTool == 'Rotate'}]"
                                @click="addInteraction('Rotate')" title="Rotate the selected annotation">
                            <span class="glyphicon glyphicon-repeat" aria-hidden="true"></span>
                            Rotate
                        </button>
                    </template>
                    <!-- <template v-if="mustBeShown('project-tools-resize') && featureSelected.getArray()[0].getGeometry().getType() != 'Point'"> TODO RESIZE
                        <button :class="['btn', 'btn-default', 'btn-xs', {active: draw.activeTool == 'Resize'}]" @click="addInteraction('Resize')" title="Resize the selected annotation">
                            <span class="glyphicon glyphicon-resize-full"></span>
                            Resize
                        </button>
                    </template> -->
                    <template v-if="mustBeShown('project-tools-move')">
                        <button :class="['btn', 'btn-default', 'btn-xs', {active: draw.activeTool == 'Drag'}]"
                                @click="addInteraction('Drag')" title="Drag the selected annotation">
                            Drag
                        </button>
                    </template>
                    <template v-if="mustBeShown('project-tools-delete')">
                        <button :class="['btn', 'btn-default', 'btn-xs', {active: draw.activeTool == 'Remove'}]"
                                @click="addInteraction('Remove')" title="Delete the selected annotation (irreversible !)">
                            <span class="glyphicon glyphicon-trash" aria-hidden="true"></span>
                        </button>
                    </template>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
    import WKT from 'ol/format/wkt';
    import LayerVector from 'ol/layer/vector';
    import SrcVector from 'ol/source/vector';
    import Collection from 'ol/collection';
    import Draw from 'ol/interaction/draw';
    import Polygon from 'ol/geom/polygon';
    import Style from 'ol/style/style';
    import Fill from 'ol/style/fill';
    import Stroke from 'ol/style/stroke';
    import Select from 'ol/interaction/select';
    import Translate from 'ol/interaction/translate';
    import Modify from 'ol/interaction/modify';
    import Rotate from 'ol-rotate-feature';
    import Sphere from 'ol/sphere';
    import Observable from 'ol/observable';
    import Overlay from 'ol/overlay';

    import mustBeShown from '../../helpers/mustBeShown';
    import pointStyle from '../../helpers/pointStyle';

    export default {
        name: 'Interactions',
        props: [
            'currentMap',
            'vectorLayersOpacity',
            'isReviewing',
        ],
        data() {
            return {
                draw: {
                    layer: {},
                    interaction: {},
                    overlay: {
                        helpTooltip: {},
                        measureTooltip: {},
                        measureTooltipElement: "",
                    },
                    activeTool: '',
                },
                featureSelected: new Collection(),
            }
        },
        computed: {
            extent() {
                return [0, 0, parseInt(this.currentMap.data.width), parseInt(this.currentMap.data.height)];
            },
            layersArray() {
                return this.$openlayers.getMap(this.currentMap.id).getLayers().getArray();
            },
            currentUserLayer() {
                let index = this.layersArray.findIndex(layer => layer.get('title') == this.currentMap.user.id);
                return this.layersArray[index];
            },
            deepFeatureSelected() {
                return this.featureSelected.getArray()[0];
            },
            featureSelectedId() {
                return this.featureSelected.getArray()[0].getId();
            }
        },
        watch: {
            deepFeatureSelected(newFeature, oldFeature) {
                this.$emit('featureSelected', newFeature);

                if (oldFeature !== undefined && oldFeature.hasOwnProperty('id_')) {
                    let color = oldFeature.getStyle().getFill().getColor();
                    let strokeColor = oldFeature.get('strokeColor');
                    if (color.length > 3) {
                        color.splice(color.length - 1, 1);
                    }
                    oldFeature.getStyle().setStroke(
                        new Stroke({
                            color: strokeColor,
                            width: 3,
                        })
                    );
                    oldFeature.getStyle().setImage(pointStyle(color, strokeColor));
                    oldFeature.changed();
                }
                if (newFeature !== undefined) {
                    let color = newFeature.getStyle().getFill().getColor();
                    let strokeColor = this.isReviewing ? newFeature.getStyle().getStroke().getColor() : [0, 0, 255];
                    newFeature.set('strokeColor', newFeature.getStyle().getStroke().getColor());
                    color[3] = this.vectorLayersOpacity + 0.3;
                    newFeature.getStyle().setStroke(
                        new Stroke({
                            color: strokeColor,
                            width: 3,
                        })
                    );
                    newFeature.getStyle().setImage(pointStyle(color, strokeColor));
                    newFeature.changed();
                }
            },
        },
        methods: {
            layerIndex(array, toFind) {
                return array.findIndex(item => item.get('title') === toFind);
            },
            termIndex(array, toFind) {
                return array.findIndex(item => item.id == toFind);
            },
            userDisplayName(user) {
                return `${user.lastname} ${user.firstname} (${user.username})`
            },
            getWktLocation(feature) {
                let format = new WKT();

                // Transform circle to circular polygon
                let geometry = feature.getGeometry();
                if (geometry.getType() == 'Circle') {
                    feature.setGeometry(Polygon.fromCircle(geometry));
                }
                return format.writeFeature(feature);
            },
            /**
             * Creates a new measure tooltip
             */
            createMeasureTooltip() {
                if (this.draw.overlay.measureTooltipElement) {
                    this.draw.overlay.measureTooltipElement.parentNode.removeChild(this.draw.overlay.measureTooltipElement);
                }
                this.draw.overlay.measureTooltipElement = document.createElement('div');
                this.draw.overlay.measureTooltipElement.className = 'alert alert-info measure tooltip-measure';
                this.draw.overlay.measureTooltip = new Overlay({
                    element: this.draw.overlay.measureTooltipElement,
                    offset: [0, -15],
                    positioning: 'bottom-center'
                });
                this.$openlayers.getMap(this.currentMap.id).addOverlay(this.draw.overlay.measureTooltip);
            },
            addInteraction(interactionType, freehand = false, remove = false) {
                let currentMap = this.$openlayers.getMap(this.currentMap.id);
                let style = undefined;
                this.removeInteraction();
                this.removeOverlay(this.draw.overlay.helpTooltip);

                // Creates layer if not found
                if (this.currentUserLayer == undefined && this.layerIndex(this.layersArray, 'draw') < 0) {
                    this.draw.layer = new LayerVector({
                        title: 'draw',
                        source: new SrcVector(),
                        extent: this.extent,
                    });
                    currentMap.addLayer(this.draw.layer);
                } else if (this.currentUserLayer != undefined) {
                    this.draw.layer = this.currentUserLayer;
                }
                // Adds interaction
                let source = this.draw.layer.getSource(),
                    geometryFunction, type;
                switch (interactionType) {
                    case 'Select':
                        this.draw.interaction = new Select({
                            features: this.featureSelected,
                        });
                        currentMap.addInteraction(this.draw.interaction);
                        this.draw.activeTool = 'Select';
                        return;
                        break;
                    case 'Rectangle':
                        geometryFunction = Draw.createBox();
                        type = 'Circle';
                        this.draw.activeTool = 'Rectangle';
                        break;
                    case 'Point':
                        type = 'Point';
                        this.draw.activeTool = 'Point';
                        break;
                    case 'Circle':
                        type = 'Circle';
                        this.draw.activeTool = 'Circle';
                        break;
                    case 'Polygon':
                        type = 'Polygon';
                        if (!freehand) {
                            this.draw.activeTool = 'Polygon';
                        } else {
                            this.draw.activeTool = 'Freehand';
                        }
                        break;
                    case 'Ellipse':
                        type = 'Circle';
                        geometryFunction = function (coord, geometry) {
                            if (!geometry) {
                                geometry = new Polygon(null);
                            }
                            let originX = coord[0][0],
                                originY = coord[0][1],
                                mouseX = coord[1][0],
                                mouseY = coord[1][1],
                                newCoordinates = [],
                                deltaX = mouseX - originX,
                                deltaY = mouseY - originY,
                                centerX = originX + deltaX / 2,
                                centerY = originY + deltaY / 2;

                            for (var i = 0 * Math.PI; i < 2 * Math.PI; i += 2 * Math.PI / 15) {
                                let xPos = centerX + (deltaX / 2 * Math.sin(i)) + (deltaY / 2 * Math.cos(i));
                                let yPos = centerY + (deltaX / 2 * Math.cos(i)) + (deltaY / 2 * Math.sin(i));

                                newCoordinates.push([xPos, yPos]);
                            }

                            // Last coordinate must be identical to first one.
                            newCoordinates.pop();
                            newCoordinates.push(newCoordinates[0]);

                            geometry.setCoordinates([newCoordinates]);
                            return geometry;
                        };
                        this.draw.activeTool = 'Ellipse';
                        break;
                    case 'Arrow':
                        type = 'Circle';
                        geometryFunction = function (coord, geometry) {
                            if (!geometry) {
                                geometry = new Polygon(null);
                            }
                            let size = 300;
                            let originX = coord[0][0];
                            let originY = coord[0][1];
                            let newCoordinates = [
                                coord[0],
                                [originX - size / 2, originY - size / 2],
                                [originX - size / 4, originY - size / 2],
                                [originX - size / 4, originY - size * 2],
                                [originX + size / 4, originY - size * 2],
                                [originX + size / 4, originY - size / 2],
                                [originX + size / 2, originY - size / 2],
                                coord[0],
                            ];
                            geometry.setCoordinates([newCoordinates]);
                            return geometry;
                        };
                        this.draw.activeTool = 'Arrow';
                        break;
                    case 'Line':
                        type = "LineString";
                        this.draw.activeTool = 'Line';
                        break;
                    case 'Edit':
                        this.draw.interaction = new Modify({
                            features: this.featureSelected,
                        });
                        currentMap.addInteraction(this.draw.interaction);
                        this.draw.interaction.on('modifyend', evt => {
                            let newCoordinates = this.getWktLocation(this.featureSelected.getArray()[0]);
                            api.get(`/api/annotation/${this.featureSelectedId}.json`).then(data => {
                                data.data.location = newCoordinates;
                                api.put(`/api/annotation/${this.featureSelectedId}.json`, data.data)
                                    .then(data => {
                                        this.notification("Annotation updated", data.data.message, "success");
                                    })
                                    .catch(error => {
                                        this.notification("Cannot update annotation", error.response.data.errors, "error");
                                    })
                            })
                        });
                        this.draw.activeTool = 'Edit';
                        return;
                        break;
                    case 'Drag':
                        this.draw.interaction = new Translate({
                            features: this.featureSelected,
                        });
                        this.draw.interaction.on('translateend', evt => {
                            let newCoordinates = this.getWktLocation(this.featureSelected.getArray()[0]);
                            api.get(`/api/annotation/${this.featureSelectedId}.json`).then(data => {
                                data.data.location = newCoordinates;
                                api.put(`api/annotation/${this.featureSelectedId}.json`, data.data)
                                    .then(data => {
                                        this.notification("Annotation updated", data.data.message, "success");
                                    })
                                    .catch(error => {
                                        this.notification("Cannot update annotation", error.response.data.errors, "error");
                                    })
                            })
                        });
                        currentMap.addInteraction(this.draw.interaction);
                        this.draw.activeTool = 'Drag';
                        return;
                        break;
                    case 'Remove':
                        let userId = this.featureSelected.getArray()[0].get('user');
                        let layerIndex = this.layersArray.findIndex(layer => layer.get('title') == userId);
                        let featureIndex = this.layersArray[layerIndex].getSource().getFeatures().findIndex(feature => feature.getId() == this.featureSelectedId);

                        this.layersArray[layerIndex].getSource().removeFeature(this.layersArray[layerIndex].getSource().getFeatures()[featureIndex]);

                        api.delete(`/api/annotation/${this.featureSelectedId}.json`)
                            .then(data => {
                                this.notification("Annotation deleted", data.data.message, "success");
                                this.featureSelected.getArray().splice(0, 1);
                                this.$emit('updateAnnotationsIndex', true);
                                this.addInteraction('Select');
                            }).catch(error => {
                                this.notification("Cannot delete annotation", error.response.data.errors, "error");
                        });
                        return;
                        break;
                    case 'Resize':
                        //
                        return;
                        break;
                    case 'Fill':
                        api.put(`/api/annotation/${this.featureSelectedId}.json?&fill=true`, {
                            fill: true,
                            id: this.featureSelectedId
                        }).then(data => {
                            let format = new WKT();
                            let newCoordinates = format.readFeature(data.data.data.annotation.location).getGeometry().getCoordinates()[0];
                            let userId = this.featureSelected.getArray()[0].get('user');
                            let layerIndex = this.layersArray.findIndex(layer => layer.get('title') == userId);
                            let featureIndex = this.layersArray[layerIndex].getSource().getFeatures().findIndex(feature => feature.getId() == this.featureSelectedId)

                            this.layersArray[layerIndex].getSource().getFeatures()[featureIndex].getGeometry().setCoordinates([newCoordinates]);
                            this.notification("Annotation updated", data.data.message, "success");
                        }).catch(error => {
                            this.notification("Cannot update annotation", error.response.data.errors, "error");
                        });
                        this.addInteraction('Select');
                        return;
                        break;
                    case 'Rotate':
                        this.draw.interaction = new Rotate({
                            features: this.featureSelected,
                        });
                        this.draw.interaction.on('rotateend', evt => {
                            let newCoordinates = this.getWktLocation(this.featureSelected.getArray()[0]);
                            api.get(`/api/annotation/${this.featureSelectedId}.json`).then(data => {
                                data.data.location = newCoordinates;
                                api.put(`api/annotation/${this.featureSelectedId}.json`, data.data)
                                    .then(data => {
                                        this.notification("Annotation updated", data.data.message, "success");
                                    })
                                    .catch(error => {
                                        this.notification("Cannot update annotation", error.response.data.errors, "error");
                                    })
                            })
                        });
                        currentMap.addInteraction(this.draw.interaction);
                        this.draw.activeTool = 'Rotate';
                        return;
                        break;
                    case 'Correction':
                        type = 'Polygon';
                        if (remove == false) {
                            this.draw.activeTool = 'Union';
                        } else {
                            this.draw.activeTool = 'Difference';
                        }
                        break;
                    case 'Ruler':
                        /**
                         * Currently drawn feature.
                         * @type {ol.Feature}
                         */
                        var sketch;


                        /**
                         * The help tooltip element.
                         * @type {Element}
                         */
                        var helpTooltipElement;

                        /**
                         * Handle pointer move.
                         * @param {ol.MapBrowserEvent} evt The event.
                         */
                        var pointerMoveHandler = (evt) => {
                            if (evt.dragging) {
                                return;
                            }
                            /** @type {string} */
                            var helpMsg = 'Click to start drawing';

                            if (sketch) {
                                var geom = (sketch.getGeometry());
                                helpMsg = 'Click to continue drawing the line';
                            }

                            helpTooltipElement.innerHTML = helpMsg;
                            this.draw.overlay.helpTooltip.setPosition(evt.coordinate);

                            helpTooltipElement.classList.remove('hidden');
                        };

                        /**
                         * Creates a new help tooltip
                         */
                        let createHelpTooltip = () => {
                            if (helpTooltipElement) {
                                helpTooltipElement.parentNode.removeChild(helpTooltipElement);
                            }
                            helpTooltipElement = document.createElement('div');
                            helpTooltipElement.className = 'measure alert alert-info hidden';
                            this.draw.overlay.helpTooltip = new Overlay({
                                element: helpTooltipElement,
                                offset: [15, 0],
                                positioning: 'center-left'
                            });
                            currentMap.addOverlay(this.draw.overlay.helpTooltip);
                        }


                        currentMap.on('pointermove', pointerMoveHandler);

                        currentMap.getViewport().addEventListener('mouseout', function () {
                            helpTooltipElement.classList.add('hidden');
                        });


                        /**
                         * Format length output.
                         * @param {ol.geom.LineString} line The line.
                         * @return {string} The formatted length.
                         */
                        var formatLength = function (line) {
                            var length = Sphere.getLength(line);
                            return Math.round(length * 100) / 1000 + ' px';
                        };

                        this.createMeasureTooltip();
                        createHelpTooltip();

                        var listener;
                        type = 'LineString';
                        this.draw.activeTool = 'Ruler';
                        break;
                }

                this.draw.interaction = new Draw({
                    source,
                    type,
                    geometryFunction,
                    freehand,
                });

                if (interactionType == 'Correction') {
                    this.draw.interaction.on('drawend', evt => {
                        let location = this.getWktLocation(evt.feature);
                        let layers = this.layersArray.filter(layer => layer.getType() == "VECTOR" && layer.get('title') != 'draw').map(layer => layer.get('title'));
                        api.post(`/api/annotationcorrection.json`, {
                            image: parseInt(this.currentMap.imageId),
                            layers,
                            location,
                            remove,
                            review: this.isReviewing,
                        }).then(data => {
                            this.notification("Annotation corrected", data.data.message, "success");
                            this.$emit('updateLayers', true);
                            this.$emit('updateAnnotationsIndex', true);
                            this.selectFeature(data.data.annotation);
                        }).catch(error => {
                            this.notification("Cannot correct annotation", error.response.data.errors, "error");
                        })
                    })
                } else if (interactionType == 'Ruler') {
                    this.draw.interaction.on('drawstart',
                        (evt) => {
                            // set sketch
                            sketch = evt.feature;

                            /** @type {ol.Coordinate|undefined} */
                            var tooltipCoord = evt.coordinate;

                            listener = sketch.getGeometry().on('change', (evt) => {
                                var geom = evt.target;
                                var output;

                                output = formatLength(geom);
                                tooltipCoord = geom.getLastCoordinate();

                                this.draw.overlay.measureTooltipElement.innerHTML = output;
                                this.draw.overlay.measureTooltip.setPosition(tooltipCoord);
                            });
                        });

                    this.draw.interaction.on('drawend',
                        () => {
                            this.draw.overlay.measureTooltipElement.className = 'measure alert alert-info  tooltip-static';
                            this.draw.overlay.measureTooltip.setOffset([0, -7]);
                            // unset sketch
                            sketch = null;
                            // unset tooltip so that a new one can be created
                            this.draw.overlay.measureTooltipElement = null;
                            this.createMeasureTooltip();
                            Observable.unByKey(listener);
                        }, this);
                } else {
                    this.draw.interaction.on('drawend', evt => {
                        api.post(`/api/annotation.json`, {
                            name: "",
                            location: this.getWktLocation(evt.feature),
                            image: this.currentMap.imageId,
                            roi: false,
                            term: [],
                            user: this.currentMap.user.id,
                        }).then((data) => {
                            this.notification("Annotation added", data.data.message, "success");
                            this.$emit('updateAnnotationsIndex', true);
                            this.$emit('updateLayers', true);
                            this.selectFeature(data.data.annotation);
                        }).catch(error => {
                            this.notification("Cannot add annotation", error.response.data.errors, "error");
                        })
                    })
                }
                currentMap.addInteraction(this.draw.interaction);
            },
            removeInteraction() {
                this.$openlayers.getMap(this.currentMap.id).removeInteraction(this.draw.interaction);
            },
            removeOverlay(overlay) {
                this.$openlayers.getMap(this.currentMap.id).removeOverlay(overlay)
            },
            mustBeShown(key) {
                return mustBeShown(key, this.currentMap.projectConfig);
            },
            selectFeature(annotation) {
                let index = this.layersArray.findIndex(layer => layer.get('title') == annotation.user);
                if (index < 0) return;
                let interval = setInterval(() => {
                    let feature = this.layersArray[index].getSource().getFeatureById(annotation.id);
                    if (feature != null) {
                        clearInterval(interval);
                        this.featureSelected.clear();
                        this.featureSelected.push(feature);
                    }
                }, 100)
            },
            notification(title, message, type, timer) {
                // Depends on [BACKBONE]
                console.log("message" + message);
                window.app.view.message(title, message, type, timer);
            },
        },
        mounted() {
            let interval = setInterval(() => {
                    if (this.$openlayers.getMap(this.currentMap.id) != undefined) {
                        this.addInteraction('Select');
                        clearInterval(interval);
                    }
                }, 500
            )
        }
    }
</script>

<style scoped>
    .toolbar-annotations {
        display: flex;
        flex-wrap: wrap;
        position: absolute;
        top: 1em;
        left: 67px;
        list-style: none;
        padding: 0;
        margin-right: 235px;
    }
</style>
