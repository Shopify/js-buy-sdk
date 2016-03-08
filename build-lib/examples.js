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

  const cartCss = sass(['examples/cart/styles'], 'styles.scss', 'examples/cart/index.css');
  const skullyCartCss = sass(['examples/skully-cart/styles'], 'styles.scss', 'examples/skully-cart/index.css');


  return mergeTrees([staticFiles, cartCss, skullyCartCss]);
};
