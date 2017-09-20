import fetch from 'node-fetch';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import multiEntry from 'rollup-plugin-multi-entry';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';
import remap from 'rollup-plugin-remap';
import graphqlCompiler from 'rollup-plugin-graphql-js-client-compiler';
import eslintTestGenerator from './scripts/rollup-plugin-eslint-test-generator';

const {livereloadPort} = require('./package.json');

const reloadUri = `http://localhost:${livereloadPort}/changed?files=tests.js,index.html`;

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
      targetPath: './test/fetch-mock-browser.js'
    }),
    globals(),
    builtins(),
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
      preferBuiltins: false
    }),
    commonjs({
      include: 'node_modules/**'
    }),
    babel({
      babelrc: false,
      presets: [
        [
          `${process.cwd()}/node_modules/babel-preset-shopify/web`, {
            modules: false
          }
        ]
      ]
    }),
    {
      onwrite() {
        fetch(reloadUri);
      }
    }
  ],
  targets: [{
    format: 'iife',
    dest: '.tmp/test/tests.js'
  }],
  sourceMap: true
};
