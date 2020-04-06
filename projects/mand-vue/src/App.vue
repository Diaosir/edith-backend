<template>
  <div id="app">
    <md-field title="input-item & vee-validate">
      <md-input-item
        title="Number"
        name="number"
        placeholder="Numeric Validate On Input"
        v-validate="'required|numeric'"
        :error="errors.first('number')"
      ></md-input-item>

      <!-- 
        Parameter of InputItem's blur event cannot adapt
        to VeeValidate, InputItem needs to
        be packaged once like this
      -->
      <!-- 
        InputItem的blur事件的入参无法满足VeeValidate，
        需要对InputItem做一次如下封装
      -->
      <input-validate
        title="Email"
        name="email"
        placeholder="Email Validate On Blur"
        v-validate="'required|email'"
        data-vv-value-path="innerValue"
        data-vv-validate-on="blur"
        :error="errors.first('email')"
      ></input-validate>

      <input-validate
        type="phone"
        title="Phone"
        name="phone"
        placeholder="Phone Validate On Blur"
        v-validate="'phone'"
        data-vv-value-path="innerValue"
        data-vv-validate-on="blur"
        :error="errors.first('phone')"
      ></input-validate>
    </md-field>
  </div>
</template>

<script>
import inputValidate from "./input-validate";
import { Validator } from "vee-validate";

Validator.extend("phone", {
  getMessage: field => `${field} value do not meet right format`,
  validate: value => /^1[34578][0-9]{9}$/.test(value)
});

export default {
  name: "App",
  components: {
    inputValidate
  }
};
</script>

<style lang="scss">
</style>
