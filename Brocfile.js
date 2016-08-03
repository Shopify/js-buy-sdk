/* global require, module */

require('babel-register')({
  presets: [
    require('babel-preset-es2015')
  ],
  plugins: [
    'transform-object-assign'
  ]
});

module.exports = require('./js-buy-sdk-build');
