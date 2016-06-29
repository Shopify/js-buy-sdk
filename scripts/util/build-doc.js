#!/usr/bin/env node

var path = require('path');
var fs = require('fs');
var yuidoc = require('./yuidoc');
var NodeGit = require('nodegit');
var checkoutOptions = {
  checkoutStrategy: ( NodeGit.Checkout.STRATEGY.FORCE + NodeGit.Checkout.STRATEGY.DONT_WRITE_INDEX ),
  paths: 'src'
}

var repo;

const MASTER_BRANCH_NAME = 'master';
const DOCUMENTATION_BRANCH_NAME = 'gh-pages';
const DOCUMENTATION_DIRECTORY = path.join('docs');

if (!fs.existsSync(DOCUMENTATION_DIRECTORY)) {
  fs.mkdirSync(DOCUMENTATION_DIRECTORY)
}

function buildTreePromise(commitPromise, name) {
  return commitPromise.then(function (commit){
    return commit.getTree();
  }).then(function (tree){
    return {
      name: name,
      tree: tree
    }
  });
}

/** This function checks out trees synchronously. 
  * Important because attempting to checkout async causes errors
  */
function checkoutTrees(datum, rest, callback, paths) {
  paths = paths || [];
  checkoutOptions.targetDirectory = path.join(repo.workdir(), DOCUMENTATION_DIRECTORY, datum.name);
  NodeGit.Checkout.tree(repo, datum.tree, checkoutOptions).then(function () {
    if (rest.length) {
      paths.push(checkoutOptions.targetDirectory)
      checkoutTrees(rest.shift(), rest, callback, paths);
    } else if (callback) {
      callback(paths);
    }
  }).catch(function (error){
    error.message = `Unable to checkout "${datum.name}" | ${error.message}`
    console.error(error);
  });
}

module.exports = {
  createSrc: function (callback) {
    var self = this;

    NodeGit.Repository.open('.').then(function (_repo) {
      repo = _repo;
      return repo.getReferences(NodeGit.Reference.TYPE.OID);
    }).then(function(references){
      var treesDataPromises = [];
      references.forEach(function(reference){
        var target = reference.targetPeel() || reference.target();
        var name = reference.shorthand();
        var commitPromise;

        if(reference.isTag()) {
          commitPromise = repo.getCommit(target);
        } else if (reference.isBranch() && reference.shorthand() === MASTER_BRANCH_NAME) {
          commitPromise = repo.getBranchCommit(name);
        } else {
          return;
        }

        treesDataPromises.push(buildTreePromise(commitPromise, name));
      });

      return Promise.all(treesDataPromises);

    }).then(function(treesData){
      var paths = [];

      checkoutTrees(treesData.shift(), treesData, function (paths) {
        if (callback) {
          callback(null, paths);
        }
      });

    }).catch(function(error){
      console.error("Error building doc");
      console.error(error);
      if (callback) {
        callback(error)
      }
    });
  },
  generateDocs: function (paths, commit, callback) {
    var self = this;
    yuidoc.generate(paths, function () {
      if (commit) {
        self.checkoutGHPagesAndCommitDocs(callback);
      } else if (callback) {
        callback();
      }
    });
  },
  checkoutGHPagesAndCommitDocs: function (callback) {
    var index;
    var treeOid;
    var repo;

    NodeGit.Repository.open('.').then(function (_repo) {
      repo = _repo;

      return repo.refreshIndex();
    }).then(function (_index) {
      index = _index;
      console.log(`Adding "${DOCUMENTATION_DIRECTORY}" directory to the staging area`);
      return index.addAll(`${DOCUMENTATION_DIRECTORY}/`);
    }).then(function () {
      console.log(`Writing out the added files to the staging area`);
      return index.write();
    }).then(function () {
      return index.writeTree();
    }).then(function (oidResult) {
      treeOid = oidResult;
      console.log(`Getting the "${DOCUMENTATION_BRANCH_NAME}" latest commit`);
      return repo.getBranchCommit(DOCUMENTATION_BRANCH_NAME);
    }).then(function(parent) {
      var dateObject = new Date();
      var time = dateObject.getTime();
      var timeOffset = dateObject.getTimezoneOffset();
      var author = NodeGit.Signature.create("Auto Docs",
        "docs@shopify.com", time, timeOffset);
      var committer = NodeGit.Signature.create("Auto Docs",
        "docs@shopify.com", time, timeOffset);

      console.log(`Committing "${DOCUMENTATION_DIRECTORY}" to "${DOCUMENTATION_BRANCH_NAME}"`);
      return repo.createCommit(`refs/heads/${DOCUMENTATION_BRANCH_NAME}`, author, committer, 'Docs auto updated during build process', treeOid, [parent]); 
    }).then(function(commitId) {
      console.log(`New commit created: ${commitId}`);
      if (callback) {
        callback();
      }
    }).catch(function (error) {
      console.error(`Error encountered while attempting to commit docs to "${DOCUMENTATION_BRANCH_NAME}"`)
      console.error(error);
      if (callback) {
        callback(error);
      }
    });
  }
}
