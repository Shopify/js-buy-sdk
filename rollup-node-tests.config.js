import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import multiEntry from 'rollup-plugin-multi-entry';
import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';
import remap from 'rollup-plugin-remap';
import graphqlCompiler from 'rollup-plugin-graphql-js-client-compiler';
import eslintTestGenerator from './scripts/rollup-plugin-eslint-test-generator';

export default {
  entry: ['test/setup.js', 'test/**/*-test.js'],
  plugins: [
    graphqlCompiler({
      schema: './schema.json'
    }),
    multiEntry({
      exports: false
    }),
    remap({
      originalPath: './test/isomorphic-fetch-mock.js',
      targetPath: './test/fetch-mock-node.js'
    }),
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
      preferBuiltins: true
    }),
    commonjs({
      include: 'node_modules/**'
    }),
    babel({
      babelrc: false,
      presets: [
        [
          `${process.cwd()}/node_modules/babel-preset-shopify/node`, {
            modules: false
          }
        ]
      ]
    })
  ],
  targets: [{
    format: 'cjs',
    dest: '.tmp/test/node-tests.js'
  }],
  external: [
    'assert',
    'url',
    'http',
    'https',
    'zlib',
    'stream',
    'buffer',
    'util',
    'string_decoder'
  ],
  sourceMap: true
};
