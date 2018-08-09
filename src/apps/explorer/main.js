import Vue from 'vue'
import App from '../../components/Explore/Explorer.vue'
import VueOpenLayers from './vue-openlayers'
import Axios from 'axios';
import * as uiv from 'uiv'
import 'vue-popperjs/dist/css/vue-popper.css';
import 'font-awesome/css/font-awesome.css'

window.api = Axios.create({});

Vue.use(VueOpenLayers);
Vue.use(uiv);
Vue.use(require('vue-moment'));

new Vue({
  el: '#app',
  render: h => h(App)
})
