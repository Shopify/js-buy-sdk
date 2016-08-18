#!/usr/bin/env node
"use strict";

const path = require('path');
const fs = require('fs');
const yuidoc = require('./yuidoc');
const NodeGit = require('nodegit');
const util = require('util');
const fsExtra = require('fs-extra');

class DocBuilder {
  constructor(options) {
    this.options = Object.assign({}, {
      themeDirRelPath: path.join('docs', 'yuidoc', 'theme'),
      apiDirRelPath: path.join('docs', 'api'),
      requestedReferenceNames: ['master'],
      checkoutStrategy: ( NodeGit.Checkout.STRATEGY.FORCE + NodeGit.Checkout.STRATEGY.DONT_WRITE_INDEX ),
    }, options);
  }

  checkoutSrcDirectories() {
    console.info('info:', 'Getting all references within the repo');
    return this.repo.getReferences(NodeGit.Reference.TYPE.OID).then(references => {
      console.info('info:', 'Picking objects for each requested references');
      const foundReferences = references.filter(reference => {
        return this.options.requestedReferenceNames.indexOf(reference.shorthand()) != -1;
      });

      const foundNames = foundReferences.map(reference => reference.shorthand()).join(', ');

      console.info('info:', 'Found', foundReferences.length, 'references', '(', foundNames, ')');

      if(!foundReferences.length) {
        throw(new Error('No reference found or can be checked out'));
      }

      const directoryPaths = [];

      return foundReferences.reduce((promise, reference) => {
        const target = reference.targetPeel() || reference.target();
        const name = reference.shorthand();

        return promise.then(() => {
          return this.repo.getCommit(target);
        }).then(commit => {
          console.info('\ninfo:', 'Getting tree for', name);

          return commit.getTree();
        }).then(tree => {
          const targetDirectory = path.join(this.repo.workdir(), this.options.apiDirRelPath, name);
          const options = {
            checkoutStrategy: this.options.checkoutStrategy,
            paths: 'src',
            targetDirectory: targetDirectory
          };

          if (fs.existsSync(targetDirectory)) {
            fsExtra.removeSync(targetDirectory);
          }
          fsExtra.mkdirsSync(targetDirectory);
          directoryPaths.push(targetDirectory);

          console.info('info:', 'Checking out', name);
          return NodeGit.Checkout.tree(this.repo, tree, options);
        })
      }, Promise.resolve()).then(() => directoryPaths);
    });
  }

  generateYUIDoc(directoryPaths) {
    console.info('\ninfo:', 'Generating API docs');
    const options = { paths: directoryPaths, themeDir: this.themeDirRelPath };
    return yuidoc.generate({paths: directoryPaths}).then(() => {
      return directoryPaths;
    });
  }

  deleteSrcDirectories(directoryPaths) {
    console.info('\ninfo:', 'Deleting SRC directories');
    return Promise.resolve().then(() => {
      directoryPaths.map(directoryPath => {
        const srcPath = path.join(directoryPath, 'src')
        console.info('info:', 'Removing', path.join(path.basename(directoryPath), 'src'));
        fsExtra.removeSync(directoryPath);
      });
    });
  }

  build() {
    return NodeGit.Repository.open('.')
      .then(repo => this.repo = repo)
      .then(this.checkoutSrcDirectories.bind(this))
      .then(this.generateYUIDoc.bind(this))
      .then(this.deleteSrcDirectories.bind(this));
  }

}
module.exports = function(options) {
  return new DocBuilder(options);
};
