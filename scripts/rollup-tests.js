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
const eslintTestGenerator = require('./rollup-plugin-eslint-test-generator');

function envRollupInfo({browser, withDependencyTracking}) {
  const format = (browser) ? 'iife' : 'cjs';
  const plugins = [
    json(),
    eslintTestGenerator({
      paths: [
        'src',
        'test'
      ]
    }),
    commonjs({
      include: 'node_modules/**'
    }),
    nodeResolve({
      jsnext: true,
      main: true,
      preferBuiltins: !browser
    }),
    babel()
  ];
  const external = [];

  // eslint-disable-next-line no-process-env
  if (!withDependencyTracking) {
    plugins.unshift(remap({
      originalPath: './src/graphl-client',
      targetPath: './src/graphl-client-dev'
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

  plugins.unshift(multiEntry({
    exports: false
  }));

  return {plugins, external, format};
}

function rollupTests({dest, withDependencyTracking, cache, browser}) {
  const {plugins, external, format} = envRollupInfo({withDependencyTracking, browser});

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
