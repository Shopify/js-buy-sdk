"use strict";

const fs = require('fs');
const path = require('path');

function mkdirp(fullPath) {

  if (!fs.existsSync(fullPath)) {
    if (mkdirp(path.dirname(fullPath))) {
      fs.mkdirSync(fullPath);
    } else {
      return false;
    }
  }

  return true;
}

module.exports = mkdirp;
