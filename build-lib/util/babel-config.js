/* global module */

"use strict";

module.exports = function (namespace, moduleType) {
  const resolveModuleSource = null;

  return {
    moduleRoot: namespace,
    moduleIds: true,
    resolveModuleSource,
    presets: [
      'es2015'
    ],
    plugins: [
      `babel-plugin-transform-es2015-modules-${moduleType}`
    ]
  };
};
