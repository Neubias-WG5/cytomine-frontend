import Vue from 'vue'
import App from '../../components/Software/Software.vue'
import Axios from 'axios';
import Datatable from 'vue2-datatable-component'
import 'vue-popperjs/dist/css/vue-popper.css';
// import '@fortawesome/fontawesome-free/css/all.css'
import * as uiv from 'uiv'

window.api = Axios.create({});

Vue.use(uiv);
Vue.use(Datatable);
Vue.use(require('vue-moment'));

new Vue({
    el: '#app-software',
    render: h => h(App)
});
