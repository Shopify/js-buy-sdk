/* globals require module */

require('./work-from-root')();

var npm = require('global-npm');
var pkg = require('../../package.json');
var path = require('path');

var followProcess = require('./follow-process');

module.exports = function (moduleScript, args, callback, options) {
  npm.load(pkg, function () {
    var scriptPath = path.join(npm.bin, moduleScript);

    followProcess('node', [scriptPath].concat(args), function (status) {
      callback(status);
    }, options);
  });
};
