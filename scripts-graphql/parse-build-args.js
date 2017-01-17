/* eslint-env node */
const minimist = require('minimist');

module.exports = function parseBuildArgs() {
  const args = minimist(process.argv.slice(2), {
    boolean: 'with-dependency-tracking',
    default: {
      'with-dependency-tracking': false
    }
  });

  const dest = args._[0];
  const withDependencyTracking = args['with-dependency-tracking'];

  return {dest, withDependencyTracking};
};
