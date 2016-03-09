'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = require('./create-class');

var _createClass2 = _interopRequireDefault(_createClass);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CoreObject = (0, _createClass2.default)({
  constructor: function constructor() {},


  static: {
    extend: function extend(subClassProps) {
      return (0, _createClass2.default)(subClassProps, this);
    }
  }
});

exports.default = CoreObject;