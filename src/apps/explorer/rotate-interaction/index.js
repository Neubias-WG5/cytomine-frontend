import { pick } from 'vuelayers/lib/_esm/util/minilo'

/** @module rotate-interaction */
import Interaction from './interaction.vue'

/**
 * @alias module:rotate-interaction
 */
export default {
    /**
     * @alias module:rotate-interaction/interaction
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
