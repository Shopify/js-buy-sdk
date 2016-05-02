/* globals module require process */

var path = require('path');
var fs = require('fs');

module.exports = function recursiveRmdir(dir) {
  var files = fs.readdirSync(dir);

  files.forEach(function (file) {
    var filename = path.join(dir, file);
    var stat = fs.statSync(filename);

    if (file === '.' || file === '..') {
      // Should never reach here, but if node ever changes the readdir API, not
      // guarding against this case could obliterate a file system, so let's be
      // safe.
      return;
    } else if (stat.isDirectory()) {
      recursiveRmdir(filename);
    } else {
      fs.unlinkSync(filename);
    }
  });

  fs.rmdirSync(dir);
};
