'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _baseModel = require('./base-model');

var _baseModel2 = _interopRequireDefault(_baseModel);

var _setGuidFor = require('../metal/set-guid-for');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ReferenceModel = _baseModel2.default.extend({

  /**
    * Class for reference model
    * @class ReferenceModel
    * @constructor
  */
  constructor: function constructor(attrs) {
    if (Object.keys(attrs).indexOf('referenceId') < 0) {
      throw new Error('Missing key referenceId of reference. References to null are not allowed');
    }

    this.super.apply(this, arguments);
  },


  /**
    * get the ID for current reference (not what it refers to, but its own unique identifier)
    * @property id
    * @type {String}
  */
  get id() {
    return this.attrs[_setGuidFor.GUID_KEY];
  },

  get referenceId() {
    return this.attrs.referenceId;
  },
  set referenceId(value) {
    this.attrs.referenceId = value;

    return value;
  }

});

exports.default = ReferenceModel;