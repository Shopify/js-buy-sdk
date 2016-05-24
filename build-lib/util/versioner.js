/* global require, module, __dirname */

"use strict";

const Plugin = require('broccoli-plugin');
const path = require('path');
const fs = require('fs');
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

  const files = this.inputPaths.reduce((fileAcc, dir) => {
    const list = fs.readdirSync(dir).map(fileName => {
      return path.join(dir, fileName);
    });

    return fileAcc.concat(list);
  }, []);

  files.forEach(fileName => {
    const inputBuffer = fs.readFileSync(path.join(fileName));
    let outputBuffer;

    if (fileName.match(/^.+\.js$/)) {
      outputBuffer = this.replaceTemplateString(
        versionString,
        this.prependComment(versionString, inputBuffer)
      );
    } else {
      outputBuffer = inputBuffer;
    }

    fs.writeFileSync(path.join(this.outputPath, path.basename(fileName)), outputBuffer);
  });
};

module.exports = Versioner;
