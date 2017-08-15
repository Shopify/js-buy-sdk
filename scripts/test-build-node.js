/* eslint-env node */
const rollupTests = require('./rollup-tests');
const parseBuildArgs = require('./parse-build-args');

const {dest, withDependencyTracking, withOptimizedTypes} = parseBuildArgs();

rollupTests({dest, withDependencyTracking, withOptimizedTypes, browser: false});
