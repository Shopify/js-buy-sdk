/* eslint-env node */
const rollupTests = require('./rollup-tests');
const parseBuildArgs = require('./parse-build-args');

const {dest, withDependencyTracking} = parseBuildArgs();

rollupTests({dest, withDependencyTracking, browser: false});
