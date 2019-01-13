/* eslint-env node */
import graphqlCompiler from 'rollup-plugin-graphql-js-client-compiler';
import baseConfig from './rollup-common.config';

baseConfig.plugins.unshift(
  graphqlCompiler({
    schema: './schema.json',
    optimize: true,
    profileDocuments: ['src/graphql/**/*.graphql']
  })
);

baseConfig.targets = [
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

export default baseConfig;
