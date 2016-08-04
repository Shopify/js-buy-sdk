/* global require, module */

"use strict";

const funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const sass = require('broccoli-sass-source-maps');

module.exports = function (pathConfig) {
  const staticFiles = funnel(pathConfig.examples, {
    include: ['**/*.js', '**/*.html'],
    destDir: 'examples'
  });

  const cartCss = sass(['examples/cart/styles'], 'styles.scss', 'examples/cart/index.css', {});
  const checkoutCss = sass(['examples/checkout/styles'], 'styles.scss', 'examples/checkout/index.css', {});

  return mergeTrees([staticFiles, cartCss, checkoutCss]);
};
