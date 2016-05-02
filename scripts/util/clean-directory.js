/* globals require module */

var fileExists = require('./file-exists');
var recursiveRmdir = require('./recursive-rmdir');

module.exports = function cleanDirectory(dir) {
  if (fileExists(dir)) {
    recursiveRmdir(dir);
  }
};
