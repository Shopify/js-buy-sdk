/* globals module require process */

var path = require('path');
var fs = require('fs');


module.exports = function recursiveCpdir(src, dest) {
  var files = fs.readdirSync(src);
  var waiting = 0;

  fs.mkdirSync(dest);

  for (var file of files) {
    var srcFile = path.join(src, file);
    var destFile = path.join(dest, file);

    var stat = fs.statSync(srcFile);

    if (file === '.' || file === '..') {
      // Should never reach here, but if node ever changes the readdir API, not
      // guarding against this case could recursively duplicate the entire fs.
      return;
    } else if (stat.isDirectory()) {
      recursiveCpdir(srcFile, destFile);
    } else {
      var data = fs.readFileSync(srcFile);

      fs.writeFileSync(destFile, data);
    }
  };
};
