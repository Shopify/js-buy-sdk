'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _coreObject = require('../metal/core-object');

var _coreObject2 = _interopRequireDefault(_coreObject);

var _baseModel = require('../models/base-model');

var _baseModel2 = _interopRequireDefault(_baseModel);

var _productModel = require('../models/product-model');

var _productModel2 = _interopRequireDefault(_productModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ListingsSerializer = _coreObject2.default.extend({
  constructor: function constructor(config) {
    this.config = config;
  },
  rootKeyForType: function rootKeyForType(type) {
    return type.slice(0, -1) + '_listing';
  },


  models: {
    collections: _baseModel2.default,
    products: _productModel2.default
  },

  modelForType: function modelForType(type) {
    return this.models[type];
  },
  deserializeSingle: function deserializeSingle(type) {
    var singlePayload = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var metaAttrs = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var modelAttrs = singlePayload[this.rootKeyForType(type)];
    var model = this.modelFromAttrs(type, modelAttrs, metaAttrs);

    return model;
  },
  deserializeMultiple: function deserializeMultiple(type) {
    var _this = this;

    var collectionPayload = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var metaAttrs = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var models = collectionPayload[this.rootKeyForType(type) + 's'];

    return models.map(function (attrs) {
      var model = _this.modelFromAttrs(type, attrs, metaAttrs);

      return model;
    });
  },
  modelFromAttrs: function modelFromAttrs(type, attrs, metaAttrs) {
    var Model = this.modelForType(type);

    metaAttrs.config = this.config;

    return new Model(attrs, metaAttrs);
  }
});

exports.default = ListingsSerializer;