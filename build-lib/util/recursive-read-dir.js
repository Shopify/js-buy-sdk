"use strict";

const fs = require('fs');
const path = require('path');

function recursiveReadDir (dir) {
  let files = [];

  fs.readdirSync(dir).forEach(fileName => {
    const file = path.join(dir, fileName);
    if (fs.statSync(file).isDirectory()) {
      files = files.concat(recursiveReadDir(file));
    } else {
      files.push(file);
    }
  });
  
  return files;
}

module.exports = recursiveReadDir;
