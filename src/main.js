import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'
import Amplify from 'aws-amplify'
import aws_exports from './aws-exports'
import { components } from 'aws-amplify-vue'

Vue.config.productionTip = false

Amplify.configure(aws_exports)

new Vue({
  router,
  store,
  components: { 
    App,
    ...components
  },
  render: h => h(App)
}).$mount('#app')
