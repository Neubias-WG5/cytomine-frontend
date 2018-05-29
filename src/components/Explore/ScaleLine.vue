<template>
    <div class="scale-line">
        <div class="scale-line-top" :style="`width:${scaleLineLength}px;`">
            {{scaleLength}}
        </div>
        <div class="scale-line-bottom">
             <span v-show="magnification != 0">Magnification: {{magnification}}X</span>
        </div>
        <div class="scale-line-position">
            <position :mousePosition="mousePosition" :currentMapId="currentMap.id"></position>
        </div>

    </div>


</template>

<script>
    import Position from './Position';

    export default {
        name: 'ScaleLine',
        components: {
            Position
        },
        props: [
            'currentMap',
            'mousePosition',
            'currentZoom',
            'maxZoom'
        ],
        data() {
            return {
                scaleLineLength: 100
            }
        },
        computed: {
            magnification() {
                let magnification = Math.pow(2, this.currentZoom - this.currentMap.data.depth) * this.currentMap.data.magnification;
                return Math.round(magnification * 100) / 100;
            },
            resolution() {
                return Math.pow(2, this.currentZoom - this.currentMap.data.depth) * this.currentMap.data.resolution;
            },
            scaleLength() {
                let length = this.scaleLineLength;
                if (this.resolution != undefined && this.resolution != null && this.resolution != 0) {
                    length = Math.round(length * this.resolution * 1000) / 1000;
                    if (length > 1000) {
                        length /= 1000;
                        length = length.toPrecision(4);
                        return length + " mm";
                    } else {
                        length = length.toPrecision(4);
                        return length + " µm";
                    }
                } else {
                    return length + " pixels";
                }
            }
        }
    }
</script>

<style>
    .scale-line {
        background: white;
        position: absolute;
        z-index: 9999;
        padding: 10px 10px 5px 10px;
        display: block;
        right: 15px;
        bottom: 15px;
        font-size: xx-small;
    }

    .scale-line-top {
        box-sizing: content-box;
        border: 2px solid black;
        border-top: none;
        text-align: center;
    }

    .scale-line-bottom {
        box-sizing: content-box;
        border: 2px solid black;
        border-top: none;
        border-bottom: none;
        text-align: center;
    }

    .scale-line-position {
        text-align: center;
        padding: 5px 5px 0 5px;
    }
</style>
