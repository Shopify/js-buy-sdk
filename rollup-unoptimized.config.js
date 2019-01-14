/* eslint-env node */
import graphqlCompiler from 'rollup-plugin-graphql-js-client-compiler';
import generateBaseRollupConfig from './rollup-common.config';

const config = generateBaseRollupConfig();

config.plugins.unshift(
  graphqlCompiler({
    schema: './schema.json',
    optimize: false,
    profileDocuments: ['src/graphql/**/*.graphql']
  })
);

config.targets = [
  {format: 'umd', suffix: '.umd'}
].map((c) => {
  return {
    dest: `index.unoptimized${c.suffix}.js`,
    format: c.format
  };
});

export default config;
