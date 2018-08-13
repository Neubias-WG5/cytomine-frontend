<template>
    <span>
        <span class="item-icon" :style="`color: ${color};`">
            <i class="fa fa-square" v-if="isLeaf"></i>
            <i class="fa fa-folder" v-if="!isLeaf && !isExpanded"></i>
            <i class="fa fa-folder-open" v-else-if="!isLeaf && isExpanded"></i>
        </span>

        <span class="label" :style="`background-color: ${color}; color:${overlayColor(color)};`">
            {{ name }} <span v-if="size">({{size}}</span>
        </span>
    </span>
</template>

<script>
    export default {
        name: "Term",
        props: {
            color: String,
            name: String,
            isLeaf: {
                type: Boolean,
                default: true
            },
            isExpanded: {
                type: Boolean,
                default: false
            },
            size: Number
        },
        methods: {
            overlayColor(color) {
                if (color.indexOf("#") == 0) {
                    color = color.slice(1);
                }

                let r = parseInt(color.slice(0, 2), 16),
                    g = parseInt(color.slice(2, 4), 16),
                    b = parseInt(color.slice(4, 6), 16);
                // http://stackoverflow.com/a/3943023/112731
                return (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? '#333' : '#fff';
            }
        }
    }
</script>

<style scoped>
    .item-icon {
        display: inline-block;
        text-align: left;
        width: 20px;
    }
</style>
