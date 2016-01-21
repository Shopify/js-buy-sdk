/* global require, module */

"use strict";

const funnel = require('broccoli-funnel');
const concat = require('broccoli-concat');
const mergeTrees = require('broccoli-merge-trees');
const babelTranspiler = require('broccoli-babel-transpiler');
const pkg = require('../package.json');
const polyfills = require('./polyfills');
const loader = require('./loader');
const babelConfig = require('./util/babel-config');


function sourceTree(pathConfig, moduleType) {
  const lib = babelTranspiler(pathConfig.lib, babelConfig(pkg.name, moduleType));

  const shims = babelTranspiler(
    funnel(pathConfig.shims, { include: ['fetch.js', 'promise.js'] }),
    babelConfig(null, moduleType)
  );

  return mergeTrees([lib, shims]);
}

module.exports = function (pathConfig, env) {
  let tree;

  const amdTree = sourceTree(pathConfig, 'amdStrict');
  const polyfillTree = polyfills(env);
  const loaderTree = loader();

  if (env === 'production') {
    const amdOutput = concat(amdTree, {
      inputFiles: ['**/*.js'],
      outputFile: `${pkg.name}.amd.js`
    });

    const polyFilledAmdOutput = concat(mergeTrees([amdOutput, polyfillTree]), {
      headerFiles: ['polyfills.js'],
      inputFiles: `${pkg.name}.amd.js`,
      outputFile: `${pkg.name}.polyfilled.amd.js`
    });

    const globalsOutput = concat(mergeTrees([amdTree, loaderTree]), {
      header: ';(function () {',
      headerFiles: ['loader.js'],
      inputFiles: ['**/*.js'],
      footer: `window.SH = require('buy-button-sdk/shopify').default;
      }());`,
      outputFile: `${pkg.name}.globals.js`
    });

    const polyFilledGlobalsOutput = concat(mergeTrees([globalsOutput, polyfillTree]), {
      headerFiles: ['polyfills.js'],
      inputFiles: `${pkg.name}.globals.js`,
      outputFile: `${pkg.name}.polyfilled.globals.js`
    });

    const commonTree = sourceTree(pathConfig, 'common');
    const commonOutput = concat(commonTree, {
      inputFiles: ['**/*.js'],
      outputFile: `${pkg.name}.common.js`
    });

    const polyFilledCommonOutput = concat(mergeTrees([commonOutput, polyfillTree]), {
      headerFiles: ['polyfills.js'],
      inputFiles: `${pkg.name}.common.js`,
      outputFile: `${pkg.name}.polyfilled.common.js`
    });

    tree = mergeTrees([
      amdOutput,
      polyFilledAmdOutput,
      globalsOutput,
      polyFilledGlobalsOutput,
      commonOutput,
      polyFilledCommonOutput
    ]);
  } else {
    const amdOutput = concat(mergeTrees([amdTree, loaderTree]), {
      headerFiles: ['loader.js'],
      inputFiles: ['**/*.js'],
      outputFile: `${pkg.name}.amd.js`
    });

    tree = mergeTrees([amdOutput, polyfillTree]);
  }

  return tree;
};
