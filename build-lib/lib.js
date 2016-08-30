/* global require, module */

"use strict";

const funnel = require('broccoli-funnel');
const concat = require('broccoli-concat');
const mergeTrees = require('broccoli-merge-trees');
const babelTranspiler = require('broccoli-babel-transpiler');
const uglifyJavaScript = require('broccoli-uglify-js');
const pkg = require('../package.json');
const polyfills = require('./polyfills');
const loader = require('./loader');
const babelConfig = require('./util/babel-config');
const Licenser = require('./util/licenser');
const Versioner = require('./util/versioner');


function sourceTree(pathConfig, moduleType) {
  return babelTranspiler(pathConfig.lib, babelConfig(pkg.name, moduleType));
}

module.exports = function (pathConfig, env) {
  const polyfillTree = polyfills(env);
  const loaderTree = loader();

  const trees = [{
    name: 'amd',
    moduleType: 'amd',
    additionalTrees: [],
    concatOptions: {}
  }, {
    name: 'commonjs',
    moduleType: 'commonjs',
    additionalTrees: [],
    concatOptions: {}
  }, {
    name: 'globals',
    moduleType: 'amd',
    additionalTrees: [loaderTree],
    concatOptions: {
      header: ';(function () {',
      headerFiles: ['loader.js'],
      footer: `
        window.ShopifyBuy = require('shopify-buy/shopify').default;
        })();
      `
    }
  }].map(config => {
    const baseTree = sourceTree(pathConfig, config.moduleType);

    const bareTree = concat(mergeTrees([baseTree].concat(config.additionalTrees)), Object.assign({
      inputFiles: ['**/*.js'],
      outputFile: `${pkg.name}.${config.name}.js`,
    }, config.concatOptions));

    const polyfilledLibTree = concat(mergeTrees([polyfillTree, bareTree]), {
      headerFiles: ['polyfills.js'],
      inputFiles: ['**/*.js'],
      outputFile: `${pkg.name}.polyfilled.${config.name}.js`,
    });

    return mergeTrees([bareTree, polyfilledLibTree]);
  });

  const nodeTree = funnel(sourceTree(pathConfig, 'commonjs'), {
    srcDir: '.',
    destDir: './node-lib'
  });

  let mergedTree;

  if (env == 'production') {
    mergedTree = uglifyJavaScript(funnel(mergeTrees(trees), {
      getDestinationPath: function (path) {
        return path.replace(/\.js/, '.min.js');
      }
    }));
  } else {
    mergedTree = mergeTrees(trees);
  }

  return mergeTrees([nodeTree, loaderTree, polyfillTree, new Licenser([
    new Versioner([ mergedTree ], { templateString: '{{versionString}}' })
  ])]);
};
