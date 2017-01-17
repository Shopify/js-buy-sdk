/* eslint-env node */
const rollup = require('rollup');
const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const multiEntry = require('rollup-plugin-multi-entry');
const builtins = require('rollup-plugin-node-builtins');
const globals = require('rollup-plugin-node-globals');
const babel = require('rollup-plugin-babel');
const remap = require('@shopify/rollup-plugin-remap').default;
const eslintTestGenerator = require('./rollup-plugin-eslint-test-generator');

function envRollupInfo({browser, withDependencyTracking}) {
  const format = (browser) ? 'iife' : 'cjs';
  const plugins = [
    eslintTestGenerator({
      paths: [
        'src-graphql',
        'test-graphql'
      ]
    }),
    nodeResolve({
      jsnext: true,
      main: true
    }),
    commonjs({
      include: 'node_modules/**',
      sourceMap: false
    }),
    multiEntry({
      exports: false
    }),
    babel()
  ];
  const external = [];

  // eslint-disable-next-line no-process-env
  if (!withDependencyTracking) {
    plugins.unshift(remap({
      originalPath: './src-graphql/graphl-client',
      targetPath: './src-graphql/graphl-client-dev'
    }));
  }

  if (browser) {
    plugins.unshift(globals(), builtins());
  } else {
    external.push('assert');
  }

  return {plugins, external, format};
}

function rollupTests({dest, withDependencyTracking, cache, browser}) {
  const {plugins, external, format} = envRollupInfo({withDependencyTracking, browser});

  return rollup.rollup({
    entry: 'test-graphql/**/*-test.js',
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
