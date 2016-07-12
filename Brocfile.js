/* eslint-env node */

require('babel-register')({
  ignore: function (fileName) {
    /* eslint-disable no-var */
    var whitelistedPackages = [
      'broccoli-lint-eslint'
    ].join('|');
    /* eslint-enable no-var */

    if (fileName.match(new RegExp(whitelistedPackages))) {
      return false;
    } else if (fileName.match(/node_modules/)) {
      return true;
    }

    return false;
  },
  presets: [
    require('babel-preset-es2015')
  ],
  plugins: [
    'transform-object-assign'
  ]
});

module.exports = require('./js-buy-sdk-build');
