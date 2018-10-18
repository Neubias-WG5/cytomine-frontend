import Vue from 'vue'
import Axios from 'axios';

import VueLayers from 'vuelayers';
import ZoomifySource from './zoomify-source'
import TranslateInteraction from './translate-interaction'
import RotateInteraction from './rotate-interaction'

import * as uiv from 'uiv'
import SlVueTree from 'sl-vue-tree'
import 'vue-popperjs/dist/css/vue-popper.css';
import AsyncComputed from 'vue-async-computed';
import Datatable from 'vue2-datatable-component'

import Explorer from '../../components/Explore/Explorer.vue'
import ImageGroupList from '../../components/ImageGroup/ImageGroupList'
import Software from '../../components/Software/Software.vue'

window.api = Axios.create({});

Vue.use(uiv);
Vue.use(require('vue-moment'));
Vue.use(SlVueTree);
Vue.use(AsyncComputed);
Vue.use(Datatable);

Vue.use(VueLayers);
Vue.use(ZoomifySource);
Vue.use(TranslateInteraction);
Vue.use(RotateInteraction);

/* Multiple explore instances in old Backbone code base */
window.exploreInstances = {};
window.addExploreInstance = function(id) {
    window.exploreInstances[id] = new Vue({
        el: `#explorer-vue-${id}`,
        render: h => h(Explorer)
    });
};
window.removeExploreInstance = function(id) {
    window.exploreInstances[id].$destroy();
    window.exploreInstances[id] = null;
};


/* Image Group tab instance */
window.imageGroupTabInstance = {};
window.setImageGroupTabInstance = function(id) {
    window.imageGroupTabInstance = new Vue({
        el:`#image-group-tab-${id}`,
        render: h => h(ImageGroupList)
    })
};


/* Software tab instance */
window.softwareTabInstance = {};
window.setSoftwareTabInstance = function () {
    new Vue({
        el: '#app-software',
        render: h => h(Software)
    });
};
