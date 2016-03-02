/* global require, module */

"use strict";

const funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const sass = require('broccoli-sass');

module.exports = function (pathConfig) {
  const staticFiles = funnel(pathConfig.examples, {
    include: ['**/*.js', '**/*.html'],
    destDir: 'examples'
  });

  const css = sass(['examples/cart/styles'], 'styles.scss', 'examples/cart/index.css');

  return mergeTrees([staticFiles, css]);
};
