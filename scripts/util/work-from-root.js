/* globals require module __dirname process */
var path = require('path');

module.exports = function workFromRoot() {
  var currentDirectory = __dirname;
  var root = path.join(currentDirectory, '..', '..');

  process.chdir(root);
};
