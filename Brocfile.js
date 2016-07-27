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
    'es2015',
    'stage-2'
  ],
  plugins: [
    'transform-runtime'
  ]
});

module.exports = require('./js-buy-sdk-build');
