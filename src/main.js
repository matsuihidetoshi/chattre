import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'
import Amplify, * as AmplifyModules from 'aws-amplify'
import { AmplifyPlugin } from 'aws-amplify-vue'
import aws_exports from './aws-exports'
import { components } from 'aws-amplify-vue'

Vue.config.productionTip = false

Amplify.configure(aws_exports)

Vue.use(AmplifyPlugin, AmplifyModules)

new Vue({
  router,
  store,
  components: { 
    App,
    ...components
  },
  render: h => h(App)
}).$mount('#app')
