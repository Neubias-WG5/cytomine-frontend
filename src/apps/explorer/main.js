import Vue from 'vue'
import App from '../../components/Explore/Explorer.vue'
import VueOpenLayers from './vue-openlayers'
import Axios from 'axios';
import * as uiv from 'uiv'
import SlVueTree from 'sl-vue-tree'
import 'vue-popperjs/dist/css/vue-popper.css';

window.api = Axios.create({});

Vue.use(VueOpenLayers);
Vue.use(uiv);
Vue.use(require('vue-moment'));
Vue.use(SlVueTree);

new Vue({
  el: '#app',
  render: h => h(App)
})
