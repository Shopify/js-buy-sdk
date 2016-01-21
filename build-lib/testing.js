/* global require, module */

const funnel = require('broccoli-funnel');
const concat = require('broccoli-concat');
const mergeTrees = require('broccoli-merge-trees');
const babelTranspiler = require('broccoli-babel-transpiler');
const lintedTree = require('./util/linted-tree');
const treeFromPackage = require('./util/tree-from-package');
const babelConfig = require('./util/babel-config');
const pkg = require('../package.json');


function testFrameworkTree() {
  const testingDeps = [
    { name: 'route-recognizer', files: ['route-recognizer.js'] },
    { name: 'fake-xml-http-request', files: ['fake_xml_http_request.js'] },
    { name: 'pretender', files: ['pretender.js'] }
  ].map(function (npmPackage) {
    return treeFromPackage(npmPackage.name, npmPackage.files);
  });

  const sdkTestingTree = concat(mergeTrees(testingDeps), {
    header: ';window.fetch = null;',
    headerFiles: ['route-recognizer.js'],
    inputFiles: ['**/*.js'],
    outputFile: 'sdk-testing.js'
  });

  const qunitTree = treeFromPackage('qunitjs', ['qunit.*']);

  return mergeTrees([sdkTestingTree, qunitTree]);
}

function testsTree(pathConfig) {
  const html = funnel(pathConfig.tests, {
    include: ['index.html'],
  });

  const qunitShim = funnel(babelTranspiler(pathConfig.shims, babelConfig(null, 'amdStrict')), {
    include: ['qunit.js'],
  });

  const testJs = funnel(pathConfig.tests, {
    include: ['**/*.js']
  });

  const linterTests = mergeTrees([
    lintedTree(pathConfig.lib),
    lintedTree(testJs),
    lintedTree(pathConfig.shims)
  ]);

  const testModules = babelTranspiler(mergeTrees([testJs, linterTests]), babelConfig(`${pkg.name}/tests`, 'amdStrict'));

  const concatenatedTests = concat(mergeTrees([qunitShim, testModules]), {
    headerFiles: ['qunit.js'],
    inputFiles: '**/*.js',
    outputFile: 'tests.js'
  });

  return mergeTrees([html, concatenatedTests]);
}

module.exports = function (pathConfig /* , env */) {
  return mergeTrees([
    testFrameworkTree(),
    testsTree(pathConfig)
  ]);
};
