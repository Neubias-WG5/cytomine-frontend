import { pick } from 'vuelayers/lib/_esm/util/minilo'

/** @module translate-interaction */
import Interaction from './interaction.vue'

/**
 * @alias module:translate-interaction
 */
export default {
    /**
     * @alias module:translate-interaction/interaction
     */
    Interaction,
    /**
     * @param {Vue} Vue
     * @param {VueLayersOptions} [options]
     */
    install (Vue, options = {}) {
        options = pick(options, 'dataProjection')
        Object.assign(Interaction, options)

        Vue.component(Interaction.name, Interaction)
    },
}
