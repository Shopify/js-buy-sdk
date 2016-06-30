#!/usr/bin/env node

var path = require('path');
var fs = require('fs');
var yuidoc = require('./yuidoc');
var NodeGit = require('nodegit');
var util = require('util');
var recursiveRmdir = require('./recursive-rmdir');

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
    targetDirectory: path.join(options.repo.workdir(), options.apiDirName, datum.name)
  };

  NodeGit.Checkout.tree(options.repo, datum.tree, checkoutOptions).then(function () {
    if (rest.length) {
      paths.push(checkoutOptions.targetDirectory)
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
    docsDirName: path.join('docs'),
    apiDirName: path.join('docs', 'api'),
    srcDirName: 'src',
    rmSrcDir: false,
    commitDocs: false,
    checkoutStrategy: ( NodeGit.Checkout.STRATEGY.FORCE + NodeGit.Checkout.STRATEGY.DONT_WRITE_INDEX ),
  }, options);
}

DocBuilder.prototype.checkoutDocsBranch = function (callback) {
  var self = this;
  if (!fs.existsSync(self.options.docsDirName)) {
    fs.mkdirSync(self.options.docsDirName)
  }

  var repo;

  NodeGit.Repository.open('.').then(function (_repo) {
    repo = _repo;
    return repo.getBranchCommit(self.options.docsBranchName);
  }).then(function (commit) {      
    return commit.getTree();
  }).then(function (tree) {
    var options = {
      checkoutStrategy: self.options.checkoutStrategy,
      targetDirectory: path.join(repo.workdir(), self.options.docsDirName)
    };

    return NodeGit.Checkout.tree(repo, tree, options);
  }).then(function () {
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

  if (!fs.existsSync(self.options.apiDirName)) {
    fs.mkdirSync(self.options.apiDirName)
  }

  var repo;

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
      } else if (reference.isBranch() && reference.shorthand() === self.options.masterBranchName) {
        commitPromise = repo.getBranchCommit(name);
      } else {
        return;
      }

      treesDataPromises.push(buildTreePromise(commitPromise, name));
    });

    return Promise.all(treesDataPromises);

  }).then(function(treesData){
    var paths = [];
    var options = JSON.parse(JSON.stringify(self.options));
    options.repo = repo;

    checkoutTrees(treesData.shift(), treesData, options, function (paths) {
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
  yuidoc.generate(paths, function () {
    if (callback) {
      callback();
    }
  });
}

DocBuilder.prototype.commitAPIDocs = function (callback) {
  var index;
  var treeOid;
  var repo;
  var self = this;

  NodeGit.Repository.open('.').then(function (_repo) {
    repo = _repo;
    return repo.refreshIndex();
  }).then(function (_index) {
    index = _index;
    console.log(`Adding "${self.options.apiDirName}" directory to the staging area`);
    return index.addAll(`${self.options.apiDirName}/`, NodeGit.Index.ADD_OPTION.ADD_FORCE);
  }).then(function (did) {
    console.log(did === 0 ? "success " : 'failure ', did)
    console.log(`Writing out the added files to the staging area`);
    return index.write();
  }).then(function () {
    return index.writeTree();
  }).then(function (oidResult) {
    treeOid = oidResult;
    console.log(`Getting the "${self.options.docsBranchName}" latest commit`);
    return repo.getBranchCommit(self.options.docsBranchName);
  }).then(function(parent) {
    var dateObject = new Date();
    var time = dateObject.getTime() / 1000;
    var timeOffset = dateObject.getTimezoneOffset();
    var author = NodeGit.Signature.create("Auto Docs",
      "docs@shopify.com", time, timeOffset);
    var committer = NodeGit.Signature.create("Auto Docs",
      "docs@shopify.com", time, timeOffset);

    console.log(`Committing "${self.options.apiDirName}" to "${self.options.docsBranchName}"`);
    return repo.createCommit(`refs/heads/${self.options.docsBranchName}`, author, committer, 'Docs auto updated during build process', treeOid, [parent]); 
  }).then(function(commitId) {
    console.log(`New commit created: ${commitId}`);
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

  console.log(`Checking out ${self.options.docsBranchName}`);
  self.checkoutDocsBranch(function (error) {
    if (error) {
      if (callback) {
        callback(error);
      }
      return;
    }

    console.log(`Checking out SRC files for each version tag, including ${self.options.masterBranchName} branch`);
    self.checkoutAPISrc(function (error, paths) {
      if (error) {
        if (callback) {
          callback(error);
        }
        return;
      }

      console.log(`Generating API docs for each version tag, including ${self.options.masterBranchName} branch`);
      self.generateAPIDocs(JSON.parse(JSON.stringify(paths)), function () {

        if (self.options.rmSrcDir) {
          paths.forEach(function (item) {
            var srcPath = path.join(item, self.options.srcDirName);
            console.log(`Removing ${srcPath}`);
            recursiveRmdir(srcPath);
          })
        }


        if (self.options.commitDocs) {
          console.log(`Commiting new API docs to ${self.options.docsBranchName}`);
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