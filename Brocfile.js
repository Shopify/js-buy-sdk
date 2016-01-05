/* global require, module */
const funnel = require('broccoli-funnel');
const concat = require('broccoli-concat');
const staticCompiler = require('broccoli-static-compiler');
const mergeTrees = require('broccoli-merge-trees');
const babelTranspiler = require('broccoli-babel-transpiler');
const amdNameResolver = require('amd-name-resolver'); 
const path = require('path');
const pkg = require('./package.json');

const libSrc = 'lib';
const testSrc = 'tests';
const shimSrc = 'shims';

const indexHtml = staticCompiler(libSrc, {
  srcDir: '.',
  files: ['index.html'],
  destDir: '.'
});

function generateModuleIdFunc(prefix) {
  return function (name) {
    return `${prefix}/${name}`;
  }
}

// Shims

const shims = babelTranspiler(shimSrc, {
  moduleIds: true,
  modules: 'amdStrict',
  resolveModuleSource: amdNameResolver
});

// loader

function loaderTree() {
  const loaderDir = path.dirname(require.resolve('loader.js'));

  return funnel(loaderDir, {
    include: ['loader.js'],
    destDir: '.'
  });
}

// Code

const js = babelTranspiler(libSrc, {
  moduleRoot: pkg.name,
  moduleIds: true,
  modules: 'amdStrict',
  resolveModuleSource: amdNameResolver
});

const concatenatedJs = concat(mergeTrees([loaderTree(), js]), {
  inputFiles: ['**/*.js'],
  outputFile: `${pkg.name}/main.js`
});

// Tests

function qunitTree() {
  const qunitDir = path.dirname(require.resolve('qunitjs'));

  return funnel(qunitDir, {
    include: ['qunit.*'],
    destDir: 'vendor'
  });
}

const testJs = babelTranspiler(testSrc, {
  moduleRoot: `${pkg.name}/tests`,
  moduleIds: true,
  modules: 'amdStrict',
  resolveModuleSource: amdNameResolver
});

const testShims = funnel(shims, {
  include: ['qunit.js'],
  destDir: '.'
});

const concatenatedTestJs = concat(mergeTrees([testJs, testShims]), {
  inputFiles: ['**/*.js'],
  outputFile: `${pkg.name}/tests.js`
});


// The end
module.exports = mergeTrees([qunitTree(), concatenatedJs, concatenatedTestJs, indexHtml]);
