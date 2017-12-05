import fetch from 'node-fetch';
import graphqlCompiler from 'rollup-plugin-graphql-js-client-compiler';
import nodeResolve from 'rollup-plugin-node-resolve';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import babel from 'rollup-plugin-babel';
import remap from 'rollup-plugin-remap';
import baseConfig from './rollup-tests-common.config';

const {livereloadPort} = require('./package.json');

const reloadUri = `http://localhost:${livereloadPort}/changed?files=tests.js,index.html`;

baseConfig.plugins.unshift(
  graphqlCompiler({
    schema: './schema.json'
  })
);
baseConfig.plugins.push(
  remap({
    originalPath: './test/isomorphic-fetch-mock.js',
    targetPath: './test/fetch-mock-browser.js'
  }),
  globals(),
  builtins(),
  nodeResolve({
    jsnext: true,
    main: true,
    preferBuiltins: false
  }),
  babel({
    babelrc: false,
    presets: [
      [`${process.cwd()}/node_modules/babel-preset-env/lib/index`, {
        targets: {
          browsers: ['last 2 versions']
        },
        modules: false
      }]
    ],
    plugins: [
      `${process.cwd()}/node_modules/babel-plugin-external-helpers/lib/index`
    ]
  }),
  {
    onwrite() {
      fetch(reloadUri);
    }
  }
);

baseConfig.targets = [{
  format: 'iife',
  dest: '.tmp/test/tests.js'
}];

export default baseConfig;
