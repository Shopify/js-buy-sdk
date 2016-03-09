'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isNodeLikeEnvironment;
function isNodeLikeEnvironment() {
  var windowAbsent = typeof window === 'undefined';
  var requirePresent = typeof require === 'function';

  return windowAbsent && requirePresent;
}