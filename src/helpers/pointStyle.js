import Circle from 'ol/style/circle';
import Fill from 'ol/style/fill';
import Stroke from 'ol/style/stroke';

export default function(fillColor, strokeColor, radius = 7) {
    return new Circle({
        radius,
        fill: new Fill({
            color: fillColor,
        }),
        stroke: new Stroke({
            color: strokeColor,
            width: 3,
        })
    })
}