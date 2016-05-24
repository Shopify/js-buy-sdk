/* globals require module process */

var npmDo = require('./npm-do');

module.exports = function (dest, callback) {
  npmDo('broccoli', ['build', dest], function (buildStatus) {
    callback(buildStatus);
  });
};
