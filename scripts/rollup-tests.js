/* eslint-env node */
const rollup = require('rollup');
const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const multiEntry = require('rollup-plugin-multi-entry');
const builtins = require('rollup-plugin-node-builtins');
const globals = require('rollup-plugin-node-globals');
const babel = require('rollup-plugin-babel');
const json = require('rollup-plugin-json');
const remap = require('rollup-plugin-remap');
const graphqlCompiler = require('rollup-plugin-graphql-js-client-compiler');
const eslintTestGenerator = require('./rollup-plugin-eslint-test-generator');

console.log(process.cwd());

function envRollupInfo({browser, withDependencyTracking, withOptimizedTypes}) {
  const format = (browser) ? 'iife' : 'cjs';
  const plugins = [
    json({
      exclude: './schema.json'
    }),
    eslintTestGenerator({
      paths: [
        'src',
        'test'
      ]
    }),
    nodeResolve({
      jsnext: true,
      main: true,
      preferBuiltins: !browser
    }),
    commonjs({
      include: 'node_modules/**'
    }),
    babel({
      babelrc: false,
      // exclude: 'node_modules/babel-runtime/**',
      // runtimeHelpers: true,
      presets: [
        [
          `${process.cwd()}/node_modules/babel-preset-shopify/${browser ? 'web' : 'node'}`, {
            modules: false
          }
        ]
      ]
    })
  ];
  const external = [];

  // eslint-disable-next-line no-process-env
  if (withDependencyTracking) {
    plugins.unshift(remap({
      originalPath: './src/graphql-client',
      targetPath: './src/graphql-client-dev'
    }));
  }

  if (withOptimizedTypes) {
    plugins.unshift(remap({
      originalPath: './types',
      targetPath: './optimized-types'
    }));
  }

  if (browser) {
    plugins.unshift(globals(), builtins());
    plugins.unshift(remap({
      originalPath: './test/isomorphic-fetch-mock.js',
      targetPath: './test/fetch-mock-browser.js'
    }));
  } else {
    external.push(
      'assert',
      'url',
      'http',
      'https',
      'zlib',
      'stream',
      'buffer',
      'util',
      'string_decoder'
    );
    plugins.unshift(remap({
      originalPath: './test/isomorphic-fetch-mock.js',
      targetPath: './test/fetch-mock-node.js'
    }));
  }


  plugins.unshift(
    graphqlCompiler({
      schema: './schema.json'
    }),
    multiEntry({
      exports: false
    })
  );

  return {plugins, external, format};
}

function rollupTests({dest, withDependencyTracking, withOptimizedTypes, cache, browser}) {
  const {plugins, external, format} = envRollupInfo({withDependencyTracking, withOptimizedTypes, browser});

  return rollup.rollup({
    entry: ['test/setup.js', 'test/**/*-test.js'],
    plugins,
    external,
    cache
  }).then((bundle) => {
    return bundle.write({
      dest,
      format,
      sourceMap: 'inline'
    }).then(() => {
      return bundle;
    });
  }).catch((error) => {
    console.error(error); // eslint-disable-line no-console
    throw error;
  });
}

module.exports = rollupTests;
