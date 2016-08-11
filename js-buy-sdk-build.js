/* global require, module */

const env = require('broccoli-env').getEnv();

const mergeTrees = require('broccoli-merge-trees');

const pathConfig = {
  lib: './src',
  shims: './shims',
  tests: './tests',
  examples: './examples'
};

const loaderTree = require('./build-lib/loader')();
const polyfillTree = require('./build-lib/polyfills')();

const trees = [ loaderTree, polyfillTree ];

// trees.push(require('./build-lib/lib')(pathConfig, env));

if (env !== 'production') {
  trees.push(require('./build-lib/testing')(pathConfig, env));
}

if (process.env.EXAMPLES) {
  trees.push(require('./build-lib/examples')(pathConfig, env));
}

module.exports = mergeTrees(trees, { annotation: true });
