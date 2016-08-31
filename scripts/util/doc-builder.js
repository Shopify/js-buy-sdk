#!/usr/bin/env node
"use strict";

const latestVersion = "v" + require('../../package.json').version;
const path = require('path');
const fs = require('fs');
const yuidoc = require('./yuidoc');
const NodeGit = require('nodegit');
const util = require('util');
const fsExtra = require('fs-extra');

class DocBuilder {
  constructor(options) {
    this.options = Object.assign({}, {
      apiDirRelPath: path.join('docs', 'api'),
      srcDirRelPath: path.join('docs', 'src'),
      requestedReferenceNames: ['latest'],
      checkoutStrategy: ( NodeGit.Checkout.STRATEGY.FORCE + NodeGit.Checkout.STRATEGY.DONT_WRITE_INDEX ),
    }, options);
    
    this.options.requestedLatest = this.options.requestedReferenceNames.indexOf('latest') != -1;
  }

  checkoutSrcDirectories() {
    console.info('info:', 'Getting all references within the repo');
    return this.repo.getReferences(NodeGit.Reference.TYPE.OID).then(references => {
      console.info('info:', 'Picking objects for each requested references');
      const foundReferences = references.filter(reference => {
        if(this.options.requestedLatest && latestVersion == reference.shorthand()) {
          return true;
        }

        if(this.options.requestedReferenceNames.indexOf(reference.shorthand()) != -1) {
          return true;
        }

        return false;
      });

      const foundNames = foundReferences.map(reference => reference.shorthand()).join(', ');

      console.info('info:', 'Found', foundReferences.length, 'references', '(', foundNames, ')');

      if(!foundReferences.length) {
        throw(new Error('No reference found or can be checked out'));
      }

      const apiDocsMeta = [];

      return foundReferences.reduce((promise, reference) => {
        const target = reference.targetPeel() || reference.target();
        let name = reference.shorthand();


        return promise.then(() => {
          return this.repo.getCommit(target);
        }).then(commit => {
          console.info('\ninfo:', 'Getting tree for', name);

          return commit.getTree();
        }).then(tree => {
          let apiName = name;

          if(this.options.requestedLatest && name == latestVersion) {
            apiName = '';
          }

          const srcRelativePath = path.join(this.options.srcDirRelPath, name);
          const srcFullPath = path.join(this.repo.workdir(), srcRelativePath);
          const apiRelativePath = path.join(this.options.apiDirRelPath, apiName);
          const options = {
            checkoutStrategy: this.options.checkoutStrategy,
            paths: 'src',
            targetDirectory: srcFullPath
          };

          if (fs.existsSync(srcFullPath)) {
            fsExtra.removeSync(srcFullPath);
          }

          fsExtra.mkdirsSync(srcFullPath);

          apiDocsMeta.push({
            version: name,
            srcFullPath: srcFullPath,
            srcRelativePath: srcRelativePath,
            apiPath: apiRelativePath
          });

          console.info('info:', 'Checking out', name);
          return NodeGit.Checkout.tree(this.repo, tree, options);
        })
      }, Promise.resolve()).then(() => apiDocsMeta);
    });
  }

  generateYUIDoc(apiDocsMeta) {
    console.info('\ninfo:', 'Generating API docs');
    return yuidoc.generate(apiDocsMeta).then(() => {
      return apiDocsMeta;
    });
  }

  deleteSrcDirectories() {
    console.info('\ninfo:', 'Deleting SRC directories');
    return Promise.resolve().then(() => {
        fsExtra.removeSync(this.options.srcDirRelPath);
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
