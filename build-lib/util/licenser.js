/* global require, module, __dirname */
"use strict";

"use strict";

const recursiveReadDir = require('./recursive-read-dir');
const recursiveWriteFile = require('./recursive-write-file');
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

  this.inputPaths.forEach(dir => {
    const fileNames = recursiveReadDir(dir);
    fileNames.forEach(fileName => {
      const inputBuffer = fs.readFileSync(path.join(fileName));
      let outputBuffer;

      if (fileName.match(/^.+\.js$/)) {
        outputBuffer = `/*\n${LICENSE}*/\n\n${inputBuffer}`;
      } else {
        outputBuffer = inputBuffer;
      }

      recursiveWriteFile(fileName.replace(dir, this.outputPath), outputBuffer);
    });
  });
};

module.exports = Licenser;
