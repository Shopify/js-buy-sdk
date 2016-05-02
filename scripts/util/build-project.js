/* globals require module process */

var followProcess = require('./follow-process');
var binPath = require('./node-module-bin-path');

module.exports = function (dest, callback) {
  followProcess('node', [binPath('broccoli'), 'build', dest], function (buildStatus) {
    callback(buildStatus);
  });
};
