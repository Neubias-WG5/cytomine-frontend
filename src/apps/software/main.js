import Vue from 'vue'
import App from './App.vue'
import Axios from 'axios';
import Datatable from 'vue2-datatable-component'
// import BootstrapVue from 'bootstrap-vue'
// import 'bootstrap/dist/css/bootstrap.css'
// import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'vue-popperjs/dist/css/vue-popper.css';
import 'font-awesome/css/font-awesome.css'

window.api = Axios.create({
    baseUrl: 'http://localhost:8085/',
})

// Vue.use(BootstrapVue);
Vue.use(Datatable);
Vue.use(require('vue-moment'));

new Vue({
    el: '#app-software',
    render: h => h(App)
})
