/* global require, module */

"use strict";

const amdNameResolver = require('amd-name-resolver');

module.exports = function (namespace, moduleType) {
  let resolveModuleSource;

  if (moduleType === 'amdStrict') {
    resolveModuleSource = amdNameResolver;
  } else {
    resolveModuleSource = null;
  }

  return {
    modules: moduleType,
    moduleRoot: namespace,
    moduleIds: true,
    resolveModuleSource
  };
};
