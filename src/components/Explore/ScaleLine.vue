<template>
    <div class="scale-line">
        <div class="scale-line-top" :style="`width:${scaleLineLength}px;`">
            {{scaleLength}}
        </div>
        <div class="scale-line-bottom">
            <span v-show="magnification != 0">Magnification: {{magnification}}X</span>
        </div>
        <div class="scale-line-position">
            <div>
                <div style="float: left;">x: {{currentX}}</div>
                <div style="float: right;">y: {{currentY}}</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'ScaleLine',
        props: [
            'image',
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
            currentX() {
                return Math.round(this.mousePosition[0] * 10) / 10
            },
            currentY() {
                return Math.round(this.mousePosition[1] * 10) / 10
            },
            magnification() {
                let magnification = Math.pow(2, this.currentZoom - this.image.depth) * this.image.magnification;
                return Math.round(magnification * 100) / 100;
            },
            resolution() {
                let resolution = (this.image.resolution) ? this.image.resolution : 1;
                return Math.pow(2, this.image.depth - this.currentZoom) * resolution;
            },
            scaleLength() {
                let length = Math.round(this.scaleLineLength * this.resolution * 1000) / 1000;
                if (this.image.resolution) {
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
        z-index: 900;
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
