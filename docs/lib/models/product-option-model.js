'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _baseModel = require('./base-model');

var _baseModel2 = _interopRequireDefault(_baseModel);

var _includes = require('../metal/includes');

var _includes2 = _interopRequireDefault(_includes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
  * Class for product option
  * @class Option
  * @constructor
*/
var ProductOptionModel = _baseModel2.default.extend({
  constructor: function constructor() {
    this.super.apply(this, arguments);

    this.selected = this.values[0];
  },


  /**
    * name of option (ex. "Size", "Color")
    * @property name
    * @type String
  */
  get name() {
    return this.attrs.name;
  },

  /**
    * possible values for selection
    * @property values
    * @type Array
  */
  get values() {
    return this.attrs.values;
  },

  /**
    * get/set selected option value (ex. "Large"). Setting this will update the
    * selected value on the model. Throws {Error} if setting selected to value that does not exist for option
    * @property selected
    * @type String
  */
  get selected() {
    return this._selected;
  },

  set selected(value) {
    if ((0, _includes2.default)(this.values, value)) {
      this._selected = value;
    } else {
      throw new Error('Invalid option selection for ' + this.name + '.');
    }

    return value;
  }
});

exports.default = ProductOptionModel;