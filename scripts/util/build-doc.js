#!/usr/bin/env node

var path = require('path');
var fs = require('fs');
var yuidoc = require('./yuidoc');
var NodeGit = require('nodegit');
var checkoutOptions = new NodeGit.CheckoutOptions();
  checkoutOptions.checkoutStrategy = NodeGit.Checkout.STRATEGY.FORCE + NodeGit.Checkout.STRATEGY.DONT_WRITE_INDEX;
  checkoutOptions.paths = 'src';

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

module.exports = function (callback) {
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
      yuidoc.generate(paths, callback);
    });

  }).catch(function(err){
    console.error("Error building doc");
    console.error(err);
  });
}