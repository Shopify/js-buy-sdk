'use strict';

var _global = require('./metal/global');

var _global2 = _interopRequireDefault(_global);

var _isNodeLikeEnvironment = require('./metal/is-node-like-environment');

var _isNodeLikeEnvironment2 = _interopRequireDefault(_isNodeLikeEnvironment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* global Buffer */

var btoa = _global2.default.btoa;

if (!btoa && (0, _isNodeLikeEnvironment2.default)()) {
  _global2.default.btoa = function (string) {
    return new Buffer(string).toString('base64');
  };
}