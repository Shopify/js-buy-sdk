#!/usr/bin/env node
"use strict";

const latestVersion = "v" + require('../../package.json').version;
const path = require('path');
const fs = require('fs');
const yuidoc = require('./yuidoc');
const NodeGit = require('nodegit');
const util = require('util');
const fsExtra = require('fs-extra');

let repo;
let options = {
  apiDirRelPath: path.join('docs', 'api'),
  srcDirRelPath: path.join('docs', 'src'),
  checkoutStrategy: ( NodeGit.Checkout.STRATEGY.FORCE + NodeGit.Checkout.STRATEGY.DONT_WRITE_INDEX ),
}

function checkoutSrcDirectories() {
  console.info('info:', 'Getting all references within the repo');
  return repo.getReferences(NodeGit.Reference.TYPE.OID).then(references => {
    console.info('info:', 'Picking objects for each requested references');
    const foundReferences = references.filter(reference => {
      if(options.requestedLatest && latestVersion == reference.shorthand()) {
        return true;
      }

      if(options.requestedReferenceNames.indexOf(reference.shorthand()) != -1) {
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
        return repo.getCommit(target);
      }).then(commit => {
        console.info('\ninfo:', 'Getting tree for', name);

        return commit.getTree();
      }).then(tree => {
        let apiName = name;

        if(options.requestedLatest && name == latestVersion) {
          apiName = '';
        }

        const srcRelativePath = path.join(options.srcDirRelPath, name);
        const srcFullPath = path.join(repo.workdir(), srcRelativePath);
        const apiRelativePath = path.join(options.apiDirRelPath, apiName);
        const checkoutOptions = {
          checkoutStrategy: options.checkoutStrategy,
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
        return NodeGit.Checkout.tree(repo, tree, checkoutOptions);
      })
    }, Promise.resolve()).then(() => apiDocsMeta);
  });
}

function copySrcDirectory() {
  const version = latestVersion;
  const srcFullPath = path.join(process.cwd(), options.srcDirRelPath);

  fsExtra.copySync('./src', path.join(srcFullPath, 'src'));

  return Promise.resolve([{
    version: version,
    srcFullPath: srcFullPath,
    srcRelativePath: options.srcDirRelPath,
    apiPath: options.apiDirRelPath
  }]);
}

function generateYUIDoc(apiDocsMeta) {
  console.info('\ninfo:', 'Generating API docs');
  return yuidoc.generate(apiDocsMeta).then(() => {
    return apiDocsMeta;
  });
}

function deleteSrcDirectories() {
  console.info('\ninfo:', 'Deleting SRC directories');
  return Promise.resolve().then(() => {
      fsExtra.removeSync(options.srcDirRelPath);
  });
}

function build(sentOptions) {
  options = Object.assign({}, options, sentOptions);

  if(options.requestedReferenceNames) {
    options.requestedLatest = options.requestedReferenceNames.indexOf('latest') != -1;

    return NodeGit.Repository.open('.')
      .then(repoObject => repo = repoObject)
      .then(checkoutSrcDirectories)
      .then(generateYUIDoc)
      .then(deleteSrcDirectories);
  } else {
    return copySrcDirectory()
      .then(generateYUIDoc)
      .then(deleteSrcDirectories);
  }
}

module.exports = build;
