<template>
  <md-input-item
    v-model="innerValue"
    :type="type"
    :title="title"
    :name="name"
    :placeholder="placeholder"
    :error="error"
    @blur="onBlur"
  ></md-input-item>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: ""
    },
    type: {
      type: String,
      default: "text"
    },
    title: {
      type: String,
      default: ""
    },
    name: {
      type: String,
      default: ""
    },
    placeholder: {
      type: String,
      default: ""
    },
    error: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      innerValue: ""
    };
  },
  watch: {
    value: {
      handler(val) {
        this.innerValue = val;
      },
      immediate: true
    },
    innerValue(val) {
      this.$emit("input", val);
    }
  },
  methods: {
    onBlur() {
      this.$emit("blur");
    }
  }
};
</script>
