#!/usr/bin/env node

var path = require('path');
var fs = require('fs');
var yuidoc = require('./yuidoc');
var NodeGit = require('nodegit');
var util = require('util');
var recursiveRmdir = require('./recursive-rmdir');
var recursiveCpdir = require('./recursive-cpdir');

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
function checkoutTrees(datum, rest, options, callback, paths) {
  paths = paths || [];
  var checkoutOptions = {
    checkoutStrategy: options.checkoutStrategy,
    paths: options.srcDirName,
    targetDirectory: path.join(options.repo.workdir(), options.apiDirPath, datum.name)
  };

  NodeGit.Checkout.tree(options.repo, datum.tree, checkoutOptions).then(function () {
    paths.push(checkoutOptions.targetDirectory)
    if (rest.length) {
      checkoutTrees(rest.shift(), rest, options, callback, paths);
    } else if (callback) {
      callback(paths);
    }
  }).catch(function (error){
    error.message = `Unable to checkout "${datum.name}" | ${error.message}`
    console.error(error);
  });
}

function DocBuilder(options) {
  this.options = util._extend({
    masterBranchName: 'master',
    docsBranchName: 'gh-pages',
    docsDirName: 'docs',
    apiDirName: 'api',
    srcDirName: 'src',
    rmSrcDir: false,
    commitDocs: false,
    checkoutStrategy: ( NodeGit.Checkout.STRATEGY.FORCE + NodeGit.Checkout.STRATEGY.DONT_WRITE_INDEX ),
  }, options);

  this.options.apiDirPath = path.join(this.options.docsDirName, this.options.apiDirName);
}

DocBuilder.prototype.checkoutDocsBranch = function (callback) {
  var self = this;
  if (!fs.existsSync(self.options.docsDirName)) {
    fs.mkdirSync(self.options.docsDirName)
  }

  var repo;

  console.log(`\nChecking out ${self.options.docsBranchName} branch`);
  NodeGit.Repository.open('.').then(function (_repo) {
    repo = _repo;
    console.log(`Getting ${self.options.docsBranchName}'s latest commit`);
    return repo.getBranchCommit(self.options.docsBranchName);
  }).then(function (commit) {
    console.log(`Getting it's working tree`);
    return commit.getTree();
  }).then(function (tree) {
    var options = {
      checkoutStrategy: self.options.checkoutStrategy,
      targetDirectory: path.join(repo.workdir(), self.options.docsDirName)
    };

    console.log(`Checking out the tree to ${options.targetDirectory}`);
    return NodeGit.Checkout.tree(repo, tree, options);
  }).then(function () {
    console.log(`Done checking out ${self.options.docsBranchName}`);
    if (callback) {
      callback();
    }
  }).catch(function (error) {
    console.log('Error checking out Documentations Branch');
    console.error(error);
    if (callback) {
      callback(error);
    }
  });
}

DocBuilder.prototype.checkoutAPISrc = function (callback) {
  var self = this;
  if (!fs.existsSync(self.options.apiDirPath)) {
    fs.mkdirSync(self.options.apiDirPath)
  }

  var repo;

  console.log(`\nChecking out source code for each version tag and the ${self.options.masterBranchName} branch`);
  NodeGit.Repository.open('.').then(function (_repo) {
    repo = _repo;

    console.log(`Getting available references within the repo`);
    return repo.getReferences(NodeGit.Reference.TYPE.OID);
  }).then(function(references){
    var treesDataPromises = [];

    console.log(`Filtering them to include only tags and the ${self.options.masterBranchName} branch.`);
    references.forEach(function(reference){
      var target = reference.targetPeel() || reference.target();
      var name = reference.shorthand();
      var commitPromise;

      if(reference.isTag()) {
        commitPromise = repo.getCommit(target);
      } else if (reference.isBranch() && reference.shorthand() === self.options.masterBranchName) {
        commitPromise = repo.getBranchCommit(name);
      } else {
        return;
      }
      console.log(`Gotten a promise for commit for ${name}`);
      console.log(`Adding a promise to get commit tree for ${name}`);
      treesDataPromises.push(buildTreePromise(commitPromise, name));
    });

    console.log(`Resolving commit tree promises`);
    return Promise.all(treesDataPromises);

  }).then(function(treesData){
    var paths = [];
    var options = JSON.parse(JSON.stringify(self.options));
    options.repo = repo;

    console.log(`Checking out commit trees`);
    checkoutTrees(treesData.shift(), treesData, options, function (paths) {
      if (callback) {
        callback(null, paths);
      }
    });

  }).catch(function(error){
    console.log(`Done checking out source code`);
    console.error("Error building doc");
    console.error(error);
    if (callback) {
      callback(error)
    }
  });
}

DocBuilder.prototype.generateAPIDocs = function (paths, callback) {
  var self = this;

  console.log(`\nGenerating API docs`);
  yuidoc.generate(paths, function () {
    console.log(`\nDone generating API docs`);
    if (callback) {
      callback();
    }
  });
}

DocBuilder.prototype.commitAPIDocs = function (callback) {
  // var index;
  // var treeOid;
  var self = this;
  var repo;
  var index;
  var docsBranchCommit;
  var currentTreeId;
  var docsBranchResolvedName;
  var apiTempDir = path.join('.', self.options.apiDirName);

  console.log(`\nCommiting API Docs`);
  if (fs.existsSync(apiTempDir)) {
    recursiveRmdir(apiTempDir);
  }

  console.log(`Copying ${self.options.apiDirPath} to root directory`);
  recursiveCpdir(self.options.apiDirPath, apiTempDir);

  NodeGit.Repository.open('.').then(function (_repo) {
    repo = _repo;

    console.log(`Getting repo's current staging area`);
    return repo.index();
  }).then(function (_index) {
    index = _index;
    console.log(`Getting the staging area oID`);
    return index.writeTree();
  }).then(function (treeId) {
    currentTreeId = treeId;
    console.log(`Getting ${self.options.docsBranchName}'s latest commit`);
    return repo.getBranchCommit(self.options.docsBranchName);
  }).then(function (commit) {
    docsBranchCommit = commit;
    console.log(`Getting commit's tree`);
    return commit.getTree();
  }).then(function (tree) {
    console.log(`Loading the tree into the staging area`);
    return index.readTree(tree)
  }).then(function () {
    return repo.getReference(self.options.docsBranchName);
  }).then(function (reference) {
    docsBranchResolvedName = reference.name();
    console.log(`Blew up ${self.options.docsBranchName} into ${docsBranchResolvedName}`);
    console.log(`Staging ${self.options.apiDirName}`);
    return index.addAll(`${self.options.apiDirName}`, NodeGit.Index.ADD_OPTION.ADD_FORCE);
  }).then(function () {
    return index.write();
  }).then(function () {
    return index.writeTree();
  }).then(function (treeId) {
    var dateObject = new Date();
    var time = dateObject.getTime() / 1000;
    var timeOffset = dateObject.getTimezoneOffset();
    var author = NodeGit.Signature.create("Auto Docs",
      "docs@shopify.com", time, timeOffset);
    var committer = NodeGit.Signature.create("Auto Docs",
      "docs@shopify.com", time, timeOffset);

    console.log(`Committing "${docsBranchResolvedName}" to "${self.options.docsBranchName}"`);
    return repo.createCommit(`${docsBranchResolvedName}`, author, committer, 'Docs auto updated during build process', treeId, [docsBranchCommit]); 
  }).then(function(commitId) {
    console.log(`New commit created: ${commitId}`);
    console.log(`Now getting HEAD's commit in order to load tree back to the staging area`);
    return repo.getHeadCommit();
  }).then(function(commit) {
    return commit.getTree();
  }).then(function(tree) {
    index.readTree(tree)
  }).then(function() {
    return index.write();
  }).then(function() {
    return index.writeTree();
  }).then(function() {
    console.log(`Staging area restored back to old state`);
    console.log(`Delete ${self.options.apiDirName} from the root directory`);
    console.log(`Done commiting API docs`);
    recursiveRmdir(path.join('.', self.options.apiDirName));
    if (callback) {
      callback();
    }
  }).catch(function (error) {
    console.error(`Error encountered while attempting to commit docs to "${self.options.docsBranchName}"`)
    console.error(error);
    if (callback) {
      callback(error);
    }
  });
}

DocBuilder.prototype.build = function (callback) {
  var self = this;

  self.checkoutDocsBranch(function (error) {
    if (error) {
      if (callback) {
        callback(error);
      }
      return;
    }

    self.checkoutAPISrc(function (error, paths) {
      if (error) {
        if (callback) {
          callback(error);
        }
        return;
      }

      self.generateAPIDocs(JSON.parse(JSON.stringify(paths)), function () {

        if (self.options.rmSrcDir) {
          console.log('\nRemoving source directories');
          paths.forEach(function (item) {
            var srcPath = path.join(item, self.options.srcDirName);
            console.log(`Removing ${srcPath}`);
            recursiveRmdir(srcPath);
          })
        }

        if (self.options.commitDocs) {
          self.commitAPIDocs(callback)
        } else if (callback) {
          callback();
        }
      });
    });
  });
}

module.exports = function (options) {
  return new DocBuilder(options);
};