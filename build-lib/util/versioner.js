/* global require, module, __dirname */

"use strict";

const recursiveReadDir = require('./recursive-read-dir');
const Plugin = require('broccoli-plugin');
const path = require('path');
const fs = require('fs');
const fsExtra = require('fs-extra');
const git = require('nodegit');

const pkg = require('../../package.json');

function Versioner(inputNodes, options) {
  const defaultedOptions = options || {};

  Plugin.call(this, inputNodes, {
    annotation: defaultedOptions.annotation
  });

  this.options = defaultedOptions;
}

Versioner.VERSION = pkg.version;

Versioner.prototype = Object.create(Plugin.prototype);
Versioner.prototype.constructor = Versioner;

Versioner.prototype.build = function () {
  if (this.constructor.HEAD_COMMIT) {
    this.versionFiles();

    return null;
  }

  return git.Repository.open(path.join(__dirname, '..', '..', '.git')).then(repository => {
    return repository.getHeadCommit().then(commit => {
      this.constructor.HEAD_COMMIT = commit.id().tostrS().substr(0, 6);

      this.versionFiles();
    });
  });
};

Versioner.prototype.prependComment = function (versionString, buffer) {
  const versionComment = `/* version: ${versionString} */`;

  return `\n${versionComment}\n${buffer}`;
};

Versioner.prototype.replaceTemplateString = function (versionString, buffer) {
  const templateString = this.options.templateString;

  if (templateString) {
    return buffer.replace(templateString, versionString);
  }

  return buffer;
};

Versioner.prototype.versionFiles = function () {
  const versionString = `v${this.constructor.VERSION}-${this.constructor.HEAD_COMMIT}`;
  const files = [].concat(...this.inputPaths.map(dirname => {
    return recursiveReadDir(dirname).map(path => {
      return {
        baseDirectory: dirname,
        path: path
      }
    });
  }));

  files.forEach(file => {
    const inputBuffer = fs.readFileSync(path.join(file.path));
    const destination = file.path.replace(file.baseDirectory, this.outputPath);
    let outputBuffer;

    if (file.path.match(/^.+\.js$/)) {
      outputBuffer = this.replaceTemplateString(
        versionString,
        this.prependComment(versionString, inputBuffer)
      );
    } else {
      outputBuffer = inputBuffer;
    }

    fsExtra.outputFileSync(destination, outputBuffer);
  });
};

module.exports = Versioner;
