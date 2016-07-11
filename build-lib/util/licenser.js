/* global require, module, __dirname */
"use strict";

"use strict";

const recursiveReadDir = require('./recursive-read-dir');
const mkdirp = require('./mkdirp');
const Plugin = require('broccoli-plugin');
const path = require('path');
const fs = require('fs');

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
