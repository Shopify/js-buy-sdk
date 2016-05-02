/* globals module require process */

var childProcess = require('child_process');
var path = require('path');


module.exports = function npmBinPath(binName, callback) {
  var npmBinPath = childProcess.exec('npm bin', function (error, stdout) {
    callback(path.join(stdout.toString().trim(), binName));
  });
};
