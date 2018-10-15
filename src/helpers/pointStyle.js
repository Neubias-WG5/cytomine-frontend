import Circle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';

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
