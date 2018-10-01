<script>
    /** @module translate-interaction/interaction */
    import TranslateInteraction from 'ol/interaction/translate'
    import condition from 'ol/events/condition'
    import observableFromOlEvent from 'vuelayers/lib/_esm/rx-ext/from-ol-event'
    import interaction from 'vuelayers/lib/_esm/mixin/interaction'
    import stylesContainer from 'vuelayers/lib/_esm/mixin/styles-container'
    import { defaultEditStyle, createStyle } from 'vuelayers/lib/_esm/ol-ext/style'
    import { isCollection, isVectorSource } from 'vuelayers/lib/_esm/ol-ext/util'
    import { mapValues, isFunction } from 'vuelayers/lib/_esm/util/minilo'
    import mergeDescriptors from 'vuelayers/lib/_esm/util/multi-merge-descriptors'
    import { hasInteraction } from 'vuelayers/lib/_esm/util/assert'
    import { makeWatchers } from 'vuelayers/lib/_esm/util/vue-helpers'

    /**
     * @vueProps
     */
    const props = {
        /**
         * Source or collection identifier from IdentityMap.
         * @type {String}
         */
        source: {
            type: String,
            required: true,
        },
        /**
         * Hit-detection tolerance. Pixels inside the radius around the given position will be checked for features.
         * This only works for the canvas renderer and not for WebGL.
         * @type {number}
         */
        hitTolerance: {
            type: Number,
            default: 0,
        },
    }

    /**
     * @vueMethods
     */
    const methods = {
        /**
         * @return {Promise<ol.interaction.Translate>}
         * @protected
         */
        async createInteraction () {
            let sourceIdent = this.makeIdent(this.source)
            let source = await this.$identityMap.get(sourceIdent, this.$options.INSTANCE_PROMISE_POOL)

            if (isFunction(source.getFeatures)) {
                let features = source.getFeatures()
                if (isCollection(features)) {
                    source = features
                }
            }

            return new TranslateInteraction({
                // source: isVectorSource(source) ? source : undefined,
                features: isCollection(source) ? source : undefined,
                hitTolerance: this.hitTolerance
            })
        },
        /**
         * @return {void}
         * @protected
         */
        mount () {
            interaction.methods.mount.call(this)
        },
        /**
         * @return {void}
         * @protected
         */
        unmount () {
            interaction.methods.unmount.call(this)
        },
        /**
         * @return {void}
         * @protected
         */
        subscribeAll () {
            subscribeToInteractionChanges.call(this)
        },
    }

    const watch = makeWatchers(['source'], function () {
        this.recreate()
    })

    /**
     * @vueProto
     * @alias module:translate-interaction/interaction
     * @title vl-interaction-translate
     */
    export default {
        name: 'vl-interaction-translate',
        mixins: [interaction],
        props,
        methods,
        watch,
    }

    /**
     * @private
     */
    function subscribeToInteractionChanges () {
        hasInteraction(this)

        const translateEvents = observableFromOlEvent(this.$interaction, ['translatestart', 'translateend'])
        this.subscribeTo(translateEvents, evt => {
            ++this.rev
            this.$emit(evt.type, evt)
        })
    }
</script>
