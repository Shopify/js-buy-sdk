/* global require, module, __dirname */
"use strict";

"use strict";

const recursiveReadDir = require('./recursive-read-dir');
const Plugin = require('broccoli-plugin');
const path = require('path');
const fs = require('fs');
const fsExtra = require('fs-extra');

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

  const fileDescriptions = [].concat(...this.inputPaths.map(dirname => {
    return recursiveReadDir(dirname).map(path => {
      return {
        baseDirectory: dirname,
        path: path
      }
    });
  }));

  fileDescriptions.forEach(file => {
    const inputBuffer = fs.readFileSync(path.join(file.path));
    const destination = file.path.replace(file.baseDirectory, this.outputPath);
    let outputBuffer;

    if (file.path.match(/^.+\.js$/)) {
      outputBuffer = `/*\n${LICENSE}*/\n\n${inputBuffer}`;
    } else {
      outputBuffer = inputBuffer;
    }

    fsExtra.outputFileSync(destination, outputBuffer);
  });
};

module.exports = Licenser;
