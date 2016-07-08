"use strict";

const fs = require('fs');
const path = require('path');

function ensureDirExists (fullPath) {

  if (!fs.existsSync(fullPath)) {
    if (ensureDirExists(path.dirname(fullPath))) {
      fs.mkdirSync(fullPath);
    } else {

      return false;
    }
  }

  return true;
}

module.exports = function (fullPath, content) {
  if(ensureDirExists(path.dirname(fullPath))) {
    fs.writeFileSync(fullPath, content);

    return true;
  }

  return false;
};
