/* eslint-env node */
import {readFileSync} from 'fs';
import babel from 'rollup-plugin-babel';
import remap from 'rollup-plugin-remap';

const plugins = [babel()];
const targets = [];

// eslint-disable-next-line no-process-env
if (process.env.BUILD_MODE === 'production') {
  plugins.push(remap({
    originalPath: './src/graphl-client',
    targetPath: './src/graphl-client-dev'
  }));

  targets.push(
    {dest: 'index.js', format: 'cjs'},
    {dest: 'index.es.js', format: 'es'}
  );
} else {
  targets.push(
    {dest: 'dev.js', format: 'cjs'},
    {dest: 'dev.es.js', format: 'es'}
  );
}

const banner = `/*
${readFileSync('./LICENSE.md')}
*/`;

export default {
  plugins,
  targets,
  banner,
  entry: 'src/client.js',
  moduleName: 'ShopifyBuy',
  sourceMap: true
};
