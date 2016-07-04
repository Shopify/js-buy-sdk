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
  if (fs.existsSync(self.options.docsDirName)) {
    recursiveRmdir(self.options.docsDirName);
  }

  fs.mkdirSync(self.options.docsDirName)

  var repo;

  console.info(`\nChecking out ${self.options.docsBranchName} branch`);
  NodeGit.Repository.open('.').then(function (_repo) {
    repo = _repo;
    console.info(`Getting ${self.options.docsBranchName}'s latest commit`);
    return repo.getBranchCommit(self.options.docsBranchName);
  }).then(function (commit) {
    console.info(`Getting it's working tree`);
    return commit.getTree();
  }).then(function (tree) {
    var options = {
      checkoutStrategy: self.options.checkoutStrategy,
      targetDirectory: path.join(repo.workdir(), self.options.docsDirName)
    };

    console.info(`Checking out the tree to ${options.targetDirectory}`);
    return NodeGit.Checkout.tree(repo, tree, options);
  }).then(function () {
    console.info(`Done checking out ${self.options.docsBranchName}`);
    if (callback) {
      callback();
    }
  }).catch(function (error) {
    console.info('Error checking out Documentations Branch');
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

  console.info(`\nChecking out source code for each version tag and the ${self.options.masterBranchName} branch`);
  NodeGit.Repository.open('.').then(function (_repo) {
    repo = _repo;

    console.info(`Getting available references within the repo`);
    return repo.getReferences(NodeGit.Reference.TYPE.OID);
  }).then(function(references){
    var treesDataPromises = [];

    console.info(`Filtering them to include only tags and the ${self.options.masterBranchName} branch.`);
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
      console.info(`Gotten a promise for commit for ${name}`);
      console.info(`Adding a promise to get commit tree for ${name}`);
      treesDataPromises.push(buildTreePromise(commitPromise, name));
    });

    console.info(`Resolving commit tree promises`);
    return Promise.all(treesDataPromises);

  }).then(function(treesData){
    var paths = [];
    var options = JSON.parse(JSON.stringify(self.options));
    options.repo = repo;

    console.info(`Checking out commit trees`);
    checkoutTrees(treesData.shift(), treesData, options, function (paths) {
      console.info(`Done checking out source code`);

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
}

DocBuilder.prototype.generateAPIDocs = function (paths, callback) {
  var self = this;

  console.info(`\nGenerating API docs`);
  yuidoc.generate(paths, function () {
    console.info(`Done generating API docs`);
    if (callback) {
      callback();
    }
  });
}

DocBuilder.prototype.commitAPIDocs = function (callback) {
  var self = this;
  var repo;
  var index;
  var docsBranchCommit;
  var docsBranchResolvedName;
  var apiTempDir = path.join('.', self.options.apiDirName);
  var indexTreeId;

  console.info(`\nCommiting API Docs`);
  if (fs.existsSync(apiTempDir)) {
    recursiveRmdir(apiTempDir);
  }

  console.info(`Copying ${self.options.apiDirPath} to root directory`);
  recursiveCpdir(self.options.apiDirPath, apiTempDir);

  NodeGit.Repository.open('.').then(function (_repo) {
    repo = _repo;

    console.info(`Getting repo's current staging area`);
    return repo.index();
  }).then(function (_index) {
    index = _index;

    console.info(`Getting ${self.options.docsBranchName}'s latest commit`);
    return repo.getBranchCommit(self.options.docsBranchName);
  }).then(function (commit) {
    docsBranchCommit = commit;
    console.info(`Getting the commit's tree`);
    return commit.getTree();
  }).then(function (tree) {
    console.info(`Loading the tree into the staging area`);
    return index.readTree(tree);
  }).then(function () {
    console.info(`Staging '${self.options.apiDirName}' to '${self.options.docsBranchName}'`);
    return index.addAll(`${self.options.apiDirName}`, NodeGit.Index.ADD_OPTION.ADD_FORCE);
  }).then(function () {
    return repo.getReference(self.options.docsBranchName);
  }).then(function (reference) {
    docsBranchResolvedName = reference.name();
    console.info(`Blew up ${self.options.docsBranchName} into ${docsBranchResolvedName}`);
    console.info(`Getting the staging area tree id`);
    return index.writeTree();
  }).then(function (treeId) {
    var dateObject = new Date();
    var time = dateObject.getTime() / 1000;
    var timeOffset = dateObject.getTimezoneOffset();
    var author = NodeGit.Signature.create("Auto Docs",
      "docs@shopify.com", time, timeOffset);
    var committer = NodeGit.Signature.create("Auto Docs",
      "docs@shopify.com", time, timeOffset);

    console.info(`Committing changes to '${docsBranchResolvedName}'`);
    return repo.createCommit(`${docsBranchResolvedName}`, author, committer, 'Docs auto updated during build process', treeId, [docsBranchCommit]); 
  }).then(function(commitId) {
    console.info(`New commit created: ${commitId}`);
    console.info(`Deleting ${self.options.apiDirName} from the root directory`);
    recursiveRmdir(path.join('.', self.options.apiDirName));

    console.info(`Done commiting API docs`);
    if (callback) {
      callback(null, entryCount);
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
          console.info('\nRemoving source directories');
          paths.forEach(function (item) {
            var srcPath = path.join(item, self.options.srcDirName);
            console.info(`Removing ${srcPath}`);
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