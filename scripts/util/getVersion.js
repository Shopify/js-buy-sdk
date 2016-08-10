const gitTag = require('git-rev').tag;
const gitCommit = require('git-rev').short;

module.exports = function(callback) {
  gitTag((tag) => {
    gitCommit((commit) => {
      callback(null, `${tag}-${commit}`);
    });
  });
};