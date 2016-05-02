/* globals require module process */

var followProcess = require('./follow-process');
var binPath = require('./npm-bin-path');

module.exports = function (dest, callback) {
  binPath('broccoli', function (broccoliPath) {
    followProcess('node', [broccoliPath, 'build', dest], function (buildStatus) {
      callback(buildStatus);
    });
  });
};
