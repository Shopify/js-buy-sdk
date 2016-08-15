#!/usr/bin/env node

var path = require('path');
var fs = require('fs');
var yuidoc = require('./yuidoc');
var NodeGit = require('nodegit');
var util = require('util');
var fsExtra = require('fs-extra');

function DocBuilder(options) {
  this.options = util._extend({
    masterBranchName: 'master',
    docsBranchName: 'gh-pages',
    docsDirName: 'docs',
    versionsDirName: 'versions',
    srcDirName: 'src',
    rmSrcDir: false,
    commitDocs: false,
    checkoutStrategy: ( NodeGit.Checkout.STRATEGY.FORCE + NodeGit.Checkout.STRATEGY.DONT_WRITE_INDEX ),
  }, options);

  if (!this.options.themeDir) {
    this.options.themeDir = path.join(this.options.docsDirName, 'yuidoc', 'theme');
  }

  this.options.apiDirPath = path.join(this.options.docsDirName, this.options.versionsDirName);
}

DocBuilder.prototype.ensureDocsBranchExists = function () {
  console.info('info:', 'Ensuring \'' + this.options.docsBranchName + '\' branch exists');
  return NodeGit.Repository.open('.').then(repo => {
    return repo.getReferences(NodeGit.Reference.TYPE.OID).then(references => {
      var regex = new RegExp('/' + this.options.docsBranchName + '$'); //ensure reference name ends with the provided branch name
      var docsBranchReferences = Object.keys(references).map(function(key) {
        return references[key];
      }).filter(function(branch) {
        return branch.name().match(regex);
      });

      if (!docsBranchReferences.length) {
        throw new Error(this.options.docsBranchName + ' could not be found');
      }

      var docsBranchReference = docsBranchReferences[0];

      if(docsBranchReferences.length == 2 && docsBranchReferences[0].isRemote()) {
        docsBranchReference = docsBranchReferences[1];
      }

      if (docsBranchReference.isRemote()) {
        console.info('info:', this.options.docsBranchName, 'is not available locally. But found in remote. Attempting to create');
        return repo.getCommit(docsBranchReference.targetPeel() || docsBranchReference.target()).then(commit => {
          return repo.createBranch(this.options.docsBranchName, commit, false, repo.defaultSignature(), 'Created docs branch in local repo');
        }).then(reference => {
          console.info('info:', 'Branch created successfully');
          console.info('info:', 'Setting up', reference.shorthand(), 'to track', docsBranchReference.shorthand());
          return NodeGit.Branch.setUpstream(reference, docsBranchReference.shorthand());
        });
      }
    });
  }).then(() => {
    console.info('info:', this.options.docsBranchName, 'has been confirmed to exist');
  });
}

DocBuilder.prototype.checkoutDocsBranch = function () {
  if (fs.existsSync(this.options.docsDirName)) {
    fsExtra.removeSync(this.options.docsDirName);
  }

  fs.mkdirSync(this.options.docsDirName);

  console.info('\ninfo:', 'Checking out', this.options.docsBranchName, 'branch');
  return NodeGit.Repository.open('.').then(repo => {

    console.info('info:', 'Getting', this.options.docsBranchName, '\'s latest commit');
    return repo.getBranchCommit(this.options.docsBranchName).then(commit => {
      console.info('info:', 'Getting its working tree');
      return commit.getTree();
    }).then(tree => {
      var options = {
        checkoutStrategy: this.options.checkoutStrategy,
        targetDirectory: path.join(repo.workdir(), this.options.docsDirName)
      };

      console.info('info:', 'Checking out the tree to', options.targetDirectory);
      return NodeGit.Checkout.tree(repo, tree, options);
    }).then(() => {
      console.info('info:', 'Done checking out', this.options.docsBranchName);
    });
  });
}

DocBuilder.prototype.checkoutAPISrc = function () {
  if (!fs.existsSync(this.options.apiDirPath)) {
    fs.mkdirSync(this.options.apiDirPath);
  }

  console.info('\ninfo:', 'Checking out source code for each version tag and the', this.options.masterBranchName, 'branch');
  return NodeGit.Repository.open('.').then(repo => {

    console.info('info:', 'Getting available references within the repo');
    return repo.getReferences(NodeGit.Reference.TYPE.OID).then(references => {
      var promise = Promise.resolve();
      var paths = [];

      console.info('info:', 'Filtering them to include only tags and the', this.options.masterBranchName, 'branch.');
      references.forEach(reference => {
        var target = reference.targetPeel() || reference.target();
        var name = reference.shorthand();
        var isMasterBranch = reference.isBranch() && name === this.options.masterBranchName;

        if (!isMasterBranch && !reference.isTag()) {
          return;
        }

        promise = promise.then(() => {
          console.info('info:', 'Getting commit for', name);
          if(isMasterBranch) {
            return repo.getBranchCommit(name);
          }

          return repo.getCommit(target);
        }).then(commit => {
          console.info('info:', 'Getting tree associated with commit on', name);

          return commit.getTree();
        }).then(tree => {
          var checkoutOptions = {
            checkoutStrategy: this.options.checkoutStrategy,
            paths: this.options.srcDirName,
            targetDirectory: path.join(repo.workdir(), this.options.apiDirPath, name)
          };

          paths.push(checkoutOptions.targetDirectory);
          console.info('info:', 'Checking out the tree on', name);

          return NodeGit.Checkout.tree(repo, tree, checkoutOptions);
        });
      });

      return promise.then(() => {
        console.info('info:', 'Done checking out source code');
        return paths;
      });
    });
  });
}

DocBuilder.prototype.generateAPIDocs = function (paths) {
  console.info('\ninfo:', 'Generating API docs');
  return yuidoc.generate({paths: paths, themeDir: this.options.themeDir}).then(() => {
    console.info('info:', 'Done generating API docs');
  });

}

DocBuilder.prototype.commitAPIDocs = function () {
  var apiTempDir = path.join('.', this.options.versionsDirName);

  console.info('\ninfo:', 'Commiting API Docs');
  if (fs.existsSync(apiTempDir)) {
    fsExtra.removeSync(apiTempDir);
  }

  console.info('info:', 'Copying', this.options.apiDirPath, 'to root directory');
  fsExtra.copySync(this.options.apiDirPath, apiTempDir);

  return NodeGit.Repository.open('.').then(repo => {

    console.info('info:', 'Getting repo\'s current staging area');
    return repo.index().then(index => {
      console.info('info:', 'Getting', this.options.docsBranchName, '\'s latest commit');
      return repo.getBranchCommit(this.options.docsBranchName).then(docsBranchCommit => {
        console.info('info:', 'Getting the commit\'s tree');
        return docsBranchCommit.getTree().then(tree => {
          console.info('info:', 'Loading the tree into the staging area');
          return index.readTree(tree);
        }).then(() => {
          console.info('info:', 'Staging \'', this.options.versionsDirName, '\' to \'', this.options.docsBranchName, '\'');
          return index.addAll(`${this.options.versionsDirName}`, NodeGit.Index.ADD_OPTION.ADD_FORCE);
        }).then(() => {
          return repo.getReference(this.options.docsBranchName);
        }).then(reference => {
          var docsBranchResolvedName = reference.name();
          console.info('info:', 'Blew up', this.options.docsBranchName, 'into', docsBranchResolvedName);
          console.info('info:', 'Getting the staging area tree id');
          return index.writeTree().then(treeId => {
            var dateObject = new Date();
            var time = dateObject.getTime() / 1000;
            var timeOffset = dateObject.getTimezoneOffset();
            var author = NodeGit.Signature.create("Auto Docs",
              "docs@shopify.com", time, timeOffset);
            var committer = NodeGit.Signature.create("Auto Docs",
              "docs@shopify.com", time, timeOffset);

            console.info('info:', 'Committing changes to \'', docsBranchResolvedName, '\'');
            return repo.createCommit(`${docsBranchResolvedName}`, author, committer, 'Docs auto updated during build process', treeId, [docsBranchCommit]); 
          }).then(commitId => {
            console.info('info:', 'New commit created:', commitId);
            console.info('info:', 'Deleting', this.options.versionsDirName, 'from the root directory');
            fsExtra.removeSync(path.join('.', this.options.versionsDirName));

            console.info('info:', 'Done commiting API docs');
          });
        });
      });
    });
  });
}

DocBuilder.prototype.build = function () {
  return this.ensureDocsBranchExists().then(() => {
    return this.checkoutDocsBranch();
  }).then(() => {
    return this.checkoutAPISrc();
  }).then(paths => {
    return this.generateAPIDocs(paths).then(() => {
      if (this.options.rmSrcDir) {
        console.info('\ninfo:', 'Removing source directories');
        paths.forEach(item => {
          var srcPath = path.join(item, this.options.srcDirName);
          console.info('info:', 'Removing', srcPath);
          fsExtra.removeSync(srcPath);
        });
      }

      if (this.options.commitDocs) {
        return this.commitAPIDocs();
      }
    });
  });
}

module.exports = function (options) {
  return new DocBuilder(options);
};
