import Vue from 'vue'
import App from './components/App.vue'
import 'semantic-ui-css/semantic.min.css'
import router from './router.js'
import store from './store.js'
import "babel-core/register"
import 'babel-polyfill'

new Vue({
    el: '#app',
    render: h => h(App),
    router,
    store,
})
