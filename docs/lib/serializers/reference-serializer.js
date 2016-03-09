'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _coreObject = require('../metal/core-object');

var _coreObject2 = _interopRequireDefault(_coreObject);

var _assign = require('../metal/assign');

var _assign2 = _interopRequireDefault(_assign);

var _referenceModel = require('../models/reference-model');

var _referenceModel2 = _interopRequireDefault(_referenceModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ReferenceSerializer = _coreObject2.default.extend({
  constructor: function constructor(config) {
    this.config = config;
  },
  modelForType: function modelForType() /* type */{
    return _referenceModel2.default;
  },
  deserializeSingle: function deserializeSingle(type) {
    var singlePayload = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var metaAttrs = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var Model = this.modelForType(type);

    return new Model(singlePayload, metaAttrs);
  },
  serialize: function serialize(type, model) {
    var attrs = (0, _assign2.default)({}, model.attrs);

    return attrs;
  }
});

exports.default = ReferenceSerializer;