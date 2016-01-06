/* global require, module */

const funnel = require('broccoli-funnel');
const concat = require('broccoli-concat');
const mergeTrees = require('broccoli-merge-trees');
const babelTranspiler = require('broccoli-babel-transpiler');
const amdNameResolver = require('amd-name-resolver');
const lintedTree = require('./linted-tree');
const pkg = require('../package.json');


const testRoot = 'tests';
const libRoot = 'lib';

const html = funnel(testRoot, {
  include: ['index.html'],
  destDir: '.'
});

const rawTestJs = funnel(testRoot, {
  include: ['**/*.js'],
  destDir: '.'
});

const linterTests = lintedTree(mergeTrees([libRoot, rawTestJs]));

const tests = babelTranspiler(mergeTrees([rawTestJs, linterTests]), {
  moduleRoot: `${pkg.name}/tests`,
  moduleIds: true,
  modules: 'amdStrict',
  resolveModuleSource: amdNameResolver
});

const concatenatedTests = concat(tests, {
  inputFiles: ['**/*.js'],
  outputFile: `${pkg.name}/tests.js`
});

module.exports = mergeTrees([html, concatenatedTests]);
