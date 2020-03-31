const template = require('@babel/template').default
const traverse = require('babel-traverse').default;

describe('package test', () => {
  it('module', async () => {
    const ast = template(`
      var myModule = require("my-module");
    `);
    console.log(ast)
  })
});