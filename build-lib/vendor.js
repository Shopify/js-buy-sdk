/* global require, module */

const funnel = require('broccoli-funnel');
const concat = require('broccoli-concat');
// const staticCompiler = require('broccoli-static-compiler');
const mergeTrees = require('broccoli-merge-trees');
const babelTranspiler = require('broccoli-babel-transpiler');
const amdNameResolver = require('amd-name-resolver');
const lintedTree = require('./linted-tree');
const path = require('path');

const loaderDir = path.dirname(require.resolve('loader.js'));
const loader = funnel(loaderDir, {
  include: ['loader.js'],
  destDir: '.'
});

const shimRoot = 'shims';

const shims = babelTranspiler(mergeTrees([shimRoot, lintedTree(shimRoot)]), {
  getModuleId: function (name) {
    // Trim leading slash
    return name.slice(1);
  },
  moduleIds: true,
  modules: 'amdStrict',
  resolveModuleSource: amdNameResolver
});

const vendor = concat(mergeTrees([loader, shims]), {
  inputFiles: ['**/*.js'],
  outputFile: 'vendor.js'
});

const qunitDir = path.dirname(require.resolve('qunitjs'));
const qunit = funnel(qunitDir, {
  include: ['qunit.*'],
  destDir: 'vendor'
});

module.exports = mergeTrees([vendor, qunit]);
