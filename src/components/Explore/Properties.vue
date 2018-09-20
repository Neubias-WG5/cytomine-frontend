<template>
    <div>
        <h4>
            <i class="fas fa-tags"></i> Properties
        </h4>
        <div class="alert alert-info">Choose a color and a property to show</div>
        <div class="form-horizontal">
            <div class="form-group">
                <label for="property-color" class="col-sm-3 control-label">Color</label>
                <div class="col-sm-9">
                    <select class="form-control" :value="selectedProperty.color"
                            @input="changeColor($event.target.value)"
                            name="property-color" id="property-color">
                        <option v-for="color in colors" :key="color.value" :value="color.value">
                            {{color.name}}
                        </option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label for="properties" class="col-sm-3 control-label">Key</label>
                <div class="col-sm-9">
                    <select class="form-control" :value="selectedProperty.key"
                            @input="changeKey($event.target.value)" name="properties"
                            id="properties">
                        <option value="">No key selected</option>
                        <option v-for="property in propertiesToShow" :key="property.key" :value="property.key">
                            {{property.key}}
                        </option>
                    </select>
                </div>
            </div>

        </div>
    </div>
</template>

<script>
    import uniqby from 'lodash.uniqby'

    export default {
        name: 'Properties',
        props: [
            'properties',
            'selectedProperty'
        ],
        data() {
            return {
                colors: [
                    {
                        value: '#ffffff',
                        name: 'White'
                    },
                    {
                        value: '#ff0000',
                        name: 'Red'
                    },
                    {
                        value: '#ff6600',
                        name: 'Orange'
                    },
                    {
                        value: '#ffff00',
                        name: 'Yellow'
                    },
                    {
                        value: '#008000',
                        name: 'Green',
                    },
                    {
                        value: '#0000ff',
                        name: 'Blue',
                    },
                    {
                        value: '#800080',
                        name: 'Purple',
                    },
                    {
                        value: '#000000',
                        name: 'Black',
                    },
                ],
            }
        },
        computed: {
            propertiesToShow() {
                return uniqby(this.properties, 'key');
            },
        },
        methods: {
            changeColor(color) {
                this.$emit('update:selectedProperty', {
                    key: this.selectedProperty.key,
                    color: color
                })
            },
            changeKey(key) {
                this.$emit('update:selectedProperty', {
                    key: key,
                    color: this.selectedProperty.color
                })
            }
        },
    }
</script>

<style>

</style>
