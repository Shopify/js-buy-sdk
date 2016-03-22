/* global require, module */

const treeFromPackage = require('./util/tree-from-package');


module.exports = function () {
  return treeFromPackage('loader.js', ['loader.js']);
};
