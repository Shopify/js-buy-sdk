/* global require, module */

const funnel = require('broccoli-funnel');
const concat = require('broccoli-concat');
// const staticCompiler = require('broccoli-static-compiler');
const mergeTrees = require('broccoli-merge-trees');
const babelTranspiler = require('broccoli-babel-transpiler');
const amdNameResolver = require('amd-name-resolver');
const lintedTree = require('./linted-tree');
const path = require('path');

const vendorTrees = [];

[
  'node_modules/loader.js/loader.js',
  'node_modules/route-recognizer/dist/route-recognizer.js',
  'node_modules/fake-xml-http-request/fake_xml_http_request.js',
  'node_modules/pretender/pretender.js'
].forEach(function (fullPath) {
  const dirname = path.dirname(fullPath);
  const basename = path.basename(fullPath);

  vendorTrees.push(funnel(dirname, {
    include: [basename],
    destDir: '.'
  }));
});

const shimRoot = 'shims';

vendorTrees.push(babelTranspiler(mergeTrees([shimRoot, lintedTree(shimRoot)]), {
  getModuleId: function (name) {
    // Trim leading slash
    return name.slice(1);
  },
  moduleIds: true,
  modules: 'amdStrict',
  resolveModuleSource: amdNameResolver
}));

const vendor = concat(mergeTrees(vendorTrees), {
  inputFiles: ['**/*.js'],
  outputFile: 'vendor.js'
});

const qunitDir = path.dirname(require.resolve('qunitjs'));
const qunit = funnel(qunitDir, {
  include: ['qunit.*'],
  destDir: 'vendor'
});

module.exports = mergeTrees([vendor, qunit]);
