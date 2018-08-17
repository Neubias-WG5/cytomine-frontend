import { pick } from 'vuelayers/lib/_esm/util/minilo'

/**
 * @module zoomify-source
 */
import Source from './source.vue'

/**
 * @alias module:zoomify-source
 */
export default {
  /**
   * @alias module:zoomify-source/source
   */
  Source,
  /**
   * @param {Vue} Vue
   * @param {VueLayersOptions} [options]
   */
  install (Vue, options = {}) {
    options = pick(options, 'dataProjection')
    Object.assign(Source, options)

    Vue.component(Source.name, Source)
  },
}
