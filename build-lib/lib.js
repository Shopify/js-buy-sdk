/* global require, module */

const concat = require('broccoli-concat');
const babelTranspiler = require('broccoli-babel-transpiler');
const amdNameResolver = require('amd-name-resolver');
const pkg = require('../package.json');


const libRoot = 'lib';

const js = babelTranspiler(libRoot, {
  moduleRoot: pkg.name,
  moduleIds: true,
  modules: 'amdStrict',
  resolveModuleSource: amdNameResolver
});

module.exports = concat(js, {
  inputFiles: ['**/*.js'],
  outputFile: `${pkg.name}/main.js`
});
