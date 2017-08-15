/* eslint-env node */
const minimist = require('minimist');

module.exports = function parseBuildArgs() {
  const args = minimist(process.argv.slice(2), {
    boolean: [
      'with-dependency-tracking',
      'with-optimized-types'
    ],
    default: {
      'with-dependency-tracking': false,
      'with-optimized-types': false
    }
  });

  const dest = args._[0];
  const withDependencyTracking = args['with-dependency-tracking'];
  const withOptimizedTypes = args['with-optimized-types'];

  return {dest, withDependencyTracking, withOptimizedTypes};
};
