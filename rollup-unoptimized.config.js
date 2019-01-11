/* eslint-env node */
import graphqlCompiler from 'rollup-plugin-graphql-js-client-compiler';
import baseConfig from './rollup-common.config';

baseConfig.plugins.unshift(
  graphqlCompiler({
    schema: './schema.json',
    optimize: false,
    profileDocuments: ['src/graphql/**/*.graphql']
  })
);

baseConfig.targets = [
  {format: 'umd', suffix: '.umd'}
].map((config) => {
  return {
    dest: `index.unoptimized${config.suffix}.js`,
    format: config.format
  };
});

export default baseConfig;
