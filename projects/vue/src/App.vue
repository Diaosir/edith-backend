<template>
  <div id="app">
  huangzhen
  <Hello></Hello>
  <div class="App">111</div>
  </div>
</template>

<script>
import Hello from './components/HelloWorld.vue'
// import * as Util from './utils';
export default {
  name: 'App',
  components: {
    Hello
  }
}
</script>
<style lang='scss'>
    @import './scss/index.scss';
    #app{
        margin: 10px;
    }
</style>