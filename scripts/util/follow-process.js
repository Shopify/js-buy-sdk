/* globals module require process */

var childProcess = require('child_process');

module.exports = function followProcess(command, args, callback) {
  var child = childProcess.spawn(command, args);

  child.stdout.on('data', function (data) {
    process.stdout.write(data.toString());
  });

  child.stderr.on('data', function (data) {
    process.stderr.write(data.toString());
  });

  child.on('close', function (code) {
    callback(code);
  });
};
