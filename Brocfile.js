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


function htmlTree(htmlRoot) {
  return staticCompiler(htmlRoot, {
    srcDir: '.',
    files: ['index.html'],
    destDir: '.'
  });
}

function shimTree(shimRoot) {
  return babelTranspiler(shimRoot, {
    moduleIds: true,
    modules: 'amdStrict',
    resolveModuleSource: amdNameResolver
  });
}


function libraryTree(libRoot) {
  const loaderDir = path.dirname(require.resolve('loader.js'));
  const loaderJs = funnel(loaderDir, {
    include: ['loader.js'],
    destDir: '.'
  });

  const js = babelTranspiler(libRoot, {
    moduleRoot: pkg.name,
    moduleIds: true,
    modules: 'amdStrict',
    resolveModuleSource: amdNameResolver
  });

  return concat(mergeTrees([loaderJs, js]), {
    inputFiles: ['**/*.js'],
    outputFile: `${pkg.name}/main.js`
  });
}

function testTree(testRoot) {
  const qunitDir = path.dirname(require.resolve('qunitjs'));
  const qunitJs = funnel(qunitDir, {
    include: ['qunit.*'],
    destDir: 'vendor'
  });

  const testShims = funnel(shimTree(shimSrc), {
    include: ['qunit.js'],
    destDir: '.'
  });

  const js = babelTranspiler(testRoot, {
    moduleRoot: `${pkg.name}/tests`,
    moduleIds: true,
    modules: 'amdStrict',
    resolveModuleSource: amdNameResolver
  });

  const concatenatedTests = concat(mergeTrees([js, testShims]), {
    inputFiles: ['**/*.js'],
    outputFile: `${pkg.name}/tests.js`
  });

  return mergeTrees([qunitJs, concatenatedTests]);
}

module.exports = mergeTrees([htmlTree(libSrc), libraryTree(libSrc), testTree(testSrc)]);
