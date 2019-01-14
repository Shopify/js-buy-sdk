/* eslint-env node */
import graphqlCompiler from 'rollup-plugin-graphql-js-client-compiler';
import generateBaseRollupConfig from './rollup-common.config';

const config = generateBaseRollupConfig();

config.plugins.unshift(
  graphqlCompiler({
    schema: './schema.json',
    optimize: true,
    profileDocuments: ['src/graphql/**/*.graphql']
  })
);

config.targets = [
  {format: 'cjs', suffix: ''},
  {format: 'amd', suffix: '.amd'},
  {format: 'es', suffix: '.es'},
  {format: 'umd', suffix: '.umd'}
].map((c) => {
  return {
    dest: `index${c.suffix}.js`,
    format: c.format
  };
});

export default config;
