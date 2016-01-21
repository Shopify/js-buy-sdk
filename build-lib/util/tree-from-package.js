/* global require, module */

"use strict";

const path = require('path');
const funnel = require('broccoli-funnel');

module.exports = function (pkgName, files) {
  const pkgPath = path.dirname(require.resolve(pkgName));

  return funnel(pkgPath, {
    include: files
  });
};
