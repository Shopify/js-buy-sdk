'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NO_IMAGE_URI = undefined;

var _baseModel = require('./base-model');

var _baseModel2 = _interopRequireDefault(_baseModel);

var _productOptionModel = require('./product-option-model');

var _productOptionModel2 = _interopRequireDefault(_productOptionModel);

var _productVariantModel = require('./product-variant-model');

var _productVariantModel2 = _interopRequireDefault(_productVariantModel);

var _uniq = require('../metal/uniq');

var _uniq2 = _interopRequireDefault(_uniq);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NO_IMAGE_URI = 'https://widgets.shopifyapps.com/assets/no-image.svg';

/**
   * Class for products returned by fetch('product')
   * @class ProductModel
   * @constructor
 */
var ProductModel = _baseModel2.default.extend({
  constructor: function constructor() {
    this.super.apply(this, arguments);
  },


  /**
    * Product unique ID
    * @property id
    * @type {String}
  */
  get id() {
    return this.attrs.product_id;
  },

  /**
    * Product title
    * @property title
    * @type {String}
  */
  get title() {
    return this.attrs.title;
  },

  /**
    * Product description. The exposes the `body_html` property on the listings API
    * @property description
    * @type {String}
  */
  get description() {
    return this.attrs.body_html;
  },

  /**
    * All images associated with product.
    * @property images
    * @type {Array} array of image objects.
  */
  get images() {
    return this.attrs.images;
  },

  get memoized() {
    this._memoized = this._memoized || {};

    return this._memoized;
  },

  /**
     *  Get array of options with nested values. Useful for creating UI for selecting options.
     *
     * ```javascript
     *  var elements = product.options.map(function(option) {
     *    return '<select name="' + option.name + '">' + option.values.map(function(value) {
     *      return '<option value="' + value + '">' + value + '</option>';
     *    }) + '</select>';
     *  });
     * ```
     *
     * @attribute options
     * @type {Array|Option}
   */
  get options() {
    if (this.memoized.options) {
      return this.memoized.options;
    }

    var baseOptions = this.attrs.options;
    var variants = this.variants;

    this.memoized.options = baseOptions.map(function (option) {
      var name = option.name;

      var dupedValues = variants.reduce(function (valueList, variant) {
        var optionValueForOption = variant.optionValues.filter(function (optionValue) {
          return optionValue.name === option.name;
        })[0];

        valueList.push(optionValueForOption.value);

        return valueList;
      }, []);

      var values = (0, _uniq2.default)(dupedValues);

      return new _productOptionModel2.default({ name: name, values: values });
    });

    return this.memoized.options;
  },

  /**
    * All variants of a product.
    * @property variants
    * @type {Array|ProductVariantModel} array of ProductVariantModel instances.
  */
  get variants() {
    var _this = this;

    return this.attrs.variants.map(function (variant) {
      return new _productVariantModel2.default({ variant: variant, product: _this }, { config: _this.config });
    });
  },

  /**
    * Retrieve currently selected option values.
    * @attribute selections
    * @type {Option}
  */
  get selections() {
    return this.options.map(function (option) {
      return option.selected;
    });
  },

  /**
    * Retrieve variant for currently selected options
    * @attribute selectedVariant
    * @type {Object}
  */
  get selectedVariant() {
    var variantTitle = this.selections.join(' / ');

    return this.variants.filter(function (variant) {
      return variant.title === variantTitle;
    })[0] || null;
  },

  /**
    * Retrieve image for currently selected variantImage
    * @attribute selectedVariantImage
    * @type {Object}
  */
  get selectedVariantImage() {
    if (!this.selectedVariant) {
      return null;
    }

    return this.selectedVariant.image;
  }
});

exports.default = ProductModel;
exports.NO_IMAGE_URI = NO_IMAGE_URI;