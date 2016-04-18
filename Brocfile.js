/* global require, module */

if (process.version < 'v4.0.0') {
  require('babel-register')({
    ignore: function (fileName) {
      var whitelistedPackages = [
        'broccoli-lint-eslint'
      ].join('|');

      if (fileName.match(new RegExp(whitelistedPackages))) {
        return false;
      } else if (fileName.match(/node_modules/)) {
        return true;
      }

      return false;
    },
    presets: [
      require('babel-preset-es2015')
    ]
  });
}

module.exports = require('./js-buy-sdk-build');
