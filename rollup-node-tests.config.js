import graphqlCompiler from 'rollup-plugin-graphql-js-client-compiler';
import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import remap from 'rollup-plugin-remap';
import baseConfig from './rollup-tests-common.config';

baseConfig.plugins.unshift(
  graphqlCompiler({
    schema: './schema.json',
    optimize: true,
    profileDocuments: ['src/graphql/**/*.graphql']
  })
);
baseConfig.plugins.push(
  remap({
    originalPath: './test/isomorphic-fetch-mock.js',
    targetPath: './test/fetch-mock-node.js'
  }),
  nodeResolve({
    jsnext: true,
    main: true,
    preferBuiltins: true
  }),
  babel({
    babelrc: false,
    presets: [
      [`${process.cwd()}/node_modules/babel-preset-env/lib/index`, {
        targets: {
          node: '8.1.2'
        },
        modules: false
      }]
    ]
  })
);

baseConfig.targets = [{
  format: 'cjs',
  dest: '.tmp/test/node-tests.js'
}];

baseConfig.external = [
  'assert',
  'url',
  'http',
  'https',
  'zlib',
  'stream',
  'buffer',
  'util',
  'string_decoder'
];

export default baseConfig;
