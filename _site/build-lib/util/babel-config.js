/* global module */

"use strict";

module.exports = function (namespace, moduleType) {
  const resolveModuleSource = null;

  return {
    modules: moduleType,
    moduleRoot: namespace,
    moduleIds: true,
    resolveModuleSource
  };
};
