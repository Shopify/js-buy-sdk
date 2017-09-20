import fetch from 'node-fetch';
import nodeResolve from 'rollup-plugin-node-resolve';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import babel from 'rollup-plugin-babel';
import remap from 'rollup-plugin-remap';
import baseConfig from './rollup-tests-common.config';

const {livereloadPort} = require('./package.json');

const reloadUri = `http://localhost:${livereloadPort}/changed?files=tests.js,index.html`;

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
);

baseConfig.targets = [{
  format: 'iife',
  dest: '.tmp/test/tests.js'
}];

export default baseConfig;
