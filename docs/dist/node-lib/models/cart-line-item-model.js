'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _baseModel = require('./base-model');

var _baseModel2 = _interopRequireDefault(_baseModel);

var _setGuidFor = require('../metal/set-guid-for');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CartLineItem = _baseModel2.default.extend({
  constructor: function constructor() {
    this.super.apply(this, arguments);
  },


  get id() {
    return this.attrs[_setGuidFor.GUID_KEY];
  },

  get variant_id() {
    return this.attrs.variant_id;
  },

  get product_id() {
    return this.attrs.product_id;
  },

  get image() {
    return this.attrs.image;
  },

  get title() {
    return this.attrs.title;
  },

  get quantity() {
    return this.attrs.quantity;
  },

  set quantity(value) {
    var parsedValue = parseInt(value, 10);

    if (parsedValue < 0) {
      throw new Error('Quantities must be positive');
    } else if (parsedValue !== parseFloat(value)) {
      /* incidentally, this covers all NaN values, because NaN !== Nan */
      throw new Error('Quantities must be whole numbers');
    }

    this.attrs.quantity = parsedValue;

    return this.attrs.quantity;
  },

  get properties() {
    return this.attrs.properties || {};
  },

  set properties(value) {
    this.attrs.properties = value || {};

    return value;
  },

  get variant_title() {
    return this.attrs.variant_title;
  },

  get price() {
    return this.attrs.price;
  },

  get compare_at_price() {
    return this.attrs.compare_at_price;
  },

  get line_price() {
    return (this.quantity * parseFloat(this.price)).toFixed(2);
  },

  get grams() {
    return this.attrs.grams;
  }
});

exports.default = CartLineItem;