/* eslint-env node */
import {readFileSync} from 'fs';
import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';
import nodeResolve from 'rollup-plugin-node-resolve';
import sizes from 'rollup-plugin-sizes';

const plugins = [
  json({
    exclude: './schema.json'
  }),
  nodeResolve({
    jsnext: true,
    main: true
  }),
  babel({
    babelrc: false,
    presets: [
      [`${process.cwd()}/node_modules/babel-preset-env/lib/index`, {
        targets: {
          browsers: ['last 2 versions'],
          node: '8.1.2'
        },
        modules: false
      }]
    ],
    plugins: [
      `${process.cwd()}/node_modules/babel-plugin-external-helpers/lib/index`
    ]
  }),
  sizes()
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
  plugins: plugins,
  targets: targets,
  banner: banner,
  entry: 'src/client.js',
  moduleName: 'ShopifyBuy',
  sourceMap: true
};
