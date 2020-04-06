<template>
  <div id="app-5">
    <p>{{ message }}</p>
    <button v-on:click="reverseMessage">反转消息</button>
  </div>
</template>

<script>
const data = {
  name: 'HelloWorld',
  data () {
    return {
      message: 'Hello Vue.js!',
      msg: 'Welcome to Your Vue.js App'
    }
  },
  methods: {
    reverseMessage: function () {
      this.message = this.message.split('').reverse().join('')
    }
  },
}
console.log(data.data())
export default data;
</script>
<style scoped lang="less">
    .hello{
        color:red;
        p{
          font-size: 15px;
        }
    }
</style>
<!-- Add "scoped" attribute to limit CSS to this component only -->

