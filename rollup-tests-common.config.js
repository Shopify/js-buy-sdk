import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import multiEntry from 'rollup-plugin-multi-entry';
import eslintTestGenerator from './scripts/rollup-plugin-eslint-test-generator';

export default {
  entry: ['test/setup.js', 'test/**/*-test.js'],
  plugins: [
    multiEntry({
      exports: false
    }),
    json({
      exclude: './schema.json'
    }),
    eslintTestGenerator({
      paths: [
        'src',
        'test'
      ]
    }),
    commonjs({
      include: 'node_modules/**'
    })
  ],
  sourceMap: true
};
