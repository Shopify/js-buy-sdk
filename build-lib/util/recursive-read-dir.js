"use strict";

const fs = require('fs');
const path = require('path');

function recursiveReadDir (dir) {

  const filesArray = fs.readdirSync(dir).map(fileName => {
    const file = path.join(dir, fileName);

    if (fs.statSync(file).isDirectory()) {

      return files.concat(recursiveReadDir(file));
    }

    return file;
  });

  return [].concat(...filesArray)
}

module.exports = recursiveReadDir;
