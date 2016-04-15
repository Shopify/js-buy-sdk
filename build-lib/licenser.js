/* global require, module, fs */

const Plugin = require('broccoli-plugin');
const path = require('path');
const fs = require('fs');

const LICENSE = fs.readFileSync(path.join(__dirname, '..', 'LICENSE.txt'));

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

  const files = this.inputPaths.reduce((fileAcc, dir) => {
    const list = fs.readdirSync(dir).map(fileName => {
      return path.join(dir, fileName);
    });

    return fileAcc.concat(list);
  }, []).filter(fileName => {
    return fileName.match(/^.+\.js$/);
  });

  files.forEach(fileName => {
    const inputBuffer = fs.readFileSync(path.join(fileName));

    const outputBuffer = `/*\n${LICENSE}*/\n\n${inputBuffer}`;

    fs.writeFileSync(path.join(this.outputPath, path.basename(fileName)), outputBuffer);
  });
};

module.exports = Licenser;
