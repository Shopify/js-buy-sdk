'use strict';

var _global = require('./metal/global');

var _global2 = _interopRequireDefault(_global);

var _isNodeLikeEnvironment = require('./metal/is-node-like-environment');

var _isNodeLikeEnvironment2 = _interopRequireDefault(_isNodeLikeEnvironment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* globals require */

var fetch = _global2.default.fetch;

if (!fetch && (0, _isNodeLikeEnvironment2.default)()) {
  /* this indirection is needed because babel throws errors when
   * transpiling require('node-fetch') using `amd` plugin with babel6
   */
  var localRequire = require;

  _global2.default.fetch = localRequire('node-fetch');
  _global2.default.Response = _global2.default.fetch.Response;
}