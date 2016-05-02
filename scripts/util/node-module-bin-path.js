/* globals module require process */

var childProcess = require('child_process');
var path = require('path');

var npmBinPath = childProcess.execSync('npm bin').toString().trim();

module.exports = function nodeModuleBinPath(binName) {
  return path.join(npmBinPath, binName);
};
