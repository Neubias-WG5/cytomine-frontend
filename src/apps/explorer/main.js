import Vue from 'vue'
import App from '../../components/Explore/Explorer.vue'
import Axios from 'axios';
import * as uiv from 'uiv'
import SlVueTree from 'sl-vue-tree'
import 'vue-popperjs/dist/css/vue-popper.css';
import AsyncComputed from 'vue-async-computed';
import VueLayers from 'vuelayers';
import ZoomifySource from './zoomify-source'
import TranslateInteraction from './translate-interaction'
import RotateInteraction from './rotate-interaction'

window.api = Axios.create({});

Vue.use(uiv);
Vue.use(require('vue-moment'));
Vue.use(SlVueTree);
Vue.use(AsyncComputed);
Vue.use(VueLayers);
Vue.use(ZoomifySource);
Vue.use(TranslateInteraction);
Vue.use(RotateInteraction);

new Vue({
  el: '#app',
  render: h => h(App)
});
