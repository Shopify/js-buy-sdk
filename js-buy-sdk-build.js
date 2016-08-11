/* global require, module */

const env = require('broccoli-env').getEnv();

const mergeTrees = require('broccoli-merge-trees');

const pathConfig = {
  lib: './src',
  shims: './shims',
  tests: './tests',
  examples: './examples'
};

// this tree will create a umd module loader which can be brought in during testing
const loaderTree = require('./build-lib/loader')();
// this will output a pollyfills.js file which is also used during testing
const polyfillTree = require('./build-lib/polyfills')();

const trees = [ loaderTree, polyfillTree ];

// This is commented out because js files are generated now via npm scripts
// trees.push(require('./build-lib/lib')(pathConfig, env));

// if we're not running in production then we'll want to build tests
if (env !== 'production') {
  trees.push(require('./build-lib/testing')(pathConfig, env));
}

// if EXAMPLES is set then we want to build the example tests which are tested via selenium later
if (process.env.EXAMPLES) {
  trees.push(require('./build-lib/examples')(pathConfig, env));
}

module.exports = mergeTrees(trees, { annotation: true });
