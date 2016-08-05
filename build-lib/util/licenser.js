/* global require, module, __dirname */
"use strict";

"use strict";

const recursiveReadDir = require('./recursive-read-dir');
const mkdirp = require('./mkdirp');
const Plugin = require('broccoli-plugin');
const path = require('path');
const fs = require('fs');
var fsExtra = require('fs-extra');

const LICENSE = fs.readFileSync(path.join(__dirname, '..', '..', 'LICENSE.txt'));

function Licenser(inputNodes, options) {
  const defaultedOptions = options || {};

  Plugin.call(this, inputNodes, {
    annotation: defaultedOptions.annotation
  });

  this.options = defaultedOptions;
}

Licenser.prototype = Object.create(Plugin.prototype);
Licenser.prototype.constructor = Licenser;

Licenser.prototype.build = function () {

  let self = this; // pretend like you did not see this.

  return Promise.resolve().then(() => {
    return new Promise((resolve, reject) => {
      let files = [];

      fsExtra.walk(self.inputPaths[0]).on('data', file => {
        files.push(file.path)
      }).on('end', () => {
        resolve(files);
      });
    })
  }).then(function(foundFiles){
    console.log(foundFiles); // I expect a list of all files here. Only the root directory is listed
    console.log(recursiveReadDir(self.inputPaths[0])); //all files are listed here. which means the directory was not empty


    // this is what we have before. Runs anyways.
    const fileDescriptions = [].concat(...self.inputPaths.map(dirname => {
      return recursiveReadDir(dirname).map(fileName => {
        return {
          baseDirectory: dirname,
          fileName: fileName
        }
      });
    }));

    fileDescriptions.forEach(description => {
      const inputBuffer = fs.readFileSync(path.join(description.fileName));
      let outputBuffer;

      if (description.fileName.match(/^.+\.js$/)) {
        outputBuffer = `/*\n${LICENSE}*/\n\n${inputBuffer}`;
      } else {
        outputBuffer = inputBuffer;
      }

      const destination = description.fileName.replace(description.baseDirectory, self.outputPath);

      mkdirp(path.dirname(destination));
      fs.writeFileSync(destination, outputBuffer);
    });

  });

  const fileDescriptions = [].concat(...this.inputPaths.map(dirname => {
    return recursiveReadDir(dirname).map(fileName => {
      return {
        baseDirectory: dirname,
        fileName: fileName
      }
    });
  }));

  fileDescriptions.forEach(description => {
    const inputBuffer = fs.readFileSync(path.join(description.fileName));
    let outputBuffer;

    if (description.fileName.match(/^.+\.js$/)) {
      outputBuffer = `/*\n${LICENSE}*/\n\n${inputBuffer}`;
    } else {
      outputBuffer = inputBuffer;
    }

    const destination = description.fileName.replace(description.baseDirectory, this.outputPath);

    mkdirp(path.dirname(destination));
    fs.writeFileSync(destination, outputBuffer);
  });
};

module.exports = Licenser;
