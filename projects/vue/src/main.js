// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
/* eslint-disable no-new */
 const a = new Vue({
  el: '#app',
  components: { App },
  render(h) {
    return h(App)
  },
})
console.log(App)
