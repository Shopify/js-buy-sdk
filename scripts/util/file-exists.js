/* globals module require */

var fs = require('fs');

module.exports = function fileExists(path) {
  try {
    fs.statSync(path);

    return true;
  } catch (e) {
    return false;
  }
};
