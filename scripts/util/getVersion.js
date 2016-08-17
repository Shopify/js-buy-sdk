/**
 * This script will return a new version string which can be used in the
 * header of the distributed js files and in source.
 */

const gitTag = require('git-rev').tag;
const gitCommit = require('git-rev').short;

module.exports = function(callback) {
  gitTag((tag) => {
    gitCommit((commit) => {
      callback(null, `${tag}-${commit}`);
    });
  });
};