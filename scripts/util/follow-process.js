/* globals module require process */

var childProcess = require('child_process');

module.exports = function followProcess(command, args, callback, options) {
  var defaultedOptions = options || {};

  defaultedOptions.stdio = defaultedOptions.stdio || 'inherit';

  var child = childProcess.spawn(command, args, defaultedOptions);

  child.on('close', function (code) {
    callback(code);
  });
};
