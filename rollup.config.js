/* eslint-env node */
import {readFileSync} from 'fs';
import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';
import nodeResolve from 'rollup-plugin-node-resolve';
import graphqlCompiler from 'rollup-plugin-graphql-js-client-compiler';

const plugins = [
  graphqlCompiler({
    schema: './schema.json',
    optimize: true,
    profileDocuments: ['src/graphql/**/*.graphql']
  }),
  json({
    exclude: './schema.json'
  }),
  nodeResolve({
    jsnext: true,
    main: true
  }),
  babel()
];

const targets = [
  {format: 'cjs', suffix: ''},
  {format: 'amd', suffix: '.amd'},
  {format: 'es', suffix: '.es'},
  {format: 'umd', suffix: '.umd'}
].map((config) => {
  return {
    dest: `index${config.suffix}.js`,
    format: config.format
  };
});

const banner = `/*
${readFileSync('./LICENSE.txt')}
*/`;

export default {
  plugins,
  targets,
  banner,
  entry: 'src/client.js',
  moduleName: 'ShopifyBuy',
  sourceMap: true
};
