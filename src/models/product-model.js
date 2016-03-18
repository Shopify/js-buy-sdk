import BaseModel from './base-model';
import ProductOptionModel from './product-option-model';
import ProductVariantModel from './product-variant-model';
import uniq from '../metal/uniq';


/**
   * Class for products returned by fetch('product')
   * @class ProductModel
   * @constructor
 */
const ProductModel = BaseModel.extend({
  constructor() {
    this.super(...arguments);
  },

  get id() {
    return this.attrs.product_id;
  },

  get title() {
    return this.attrs.title;
  },

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

    const baseOptions = this.attrs.options;
    const variants = this.variants;

    this.memoized.options = baseOptions.map(option => {
      const name = option.name;

      const dupedValues = variants.reduce((valueList, variant) => {
        const optionValueForOption = variant.optionValues.filter(optionValue => {
          return optionValue.name === option.name;
        })[0];

        valueList.push(optionValueForOption.value);

        return valueList;
      }, []);

      const values = uniq(dupedValues);

      return new ProductOptionModel({ name, values });
    });

    return this.memoized.options;
  },

  get variants() {
    return this.attrs.variants.map(variant => {
      return new ProductVariantModel({ variant, product: this }, { config: this.config });
    });
  },

  /**
    * Retrieve currently selected option values.
    * @attribute selections
    * @type {Option}
   */

  get selections() {
    return this.options.map(option => {
      return option.selected;
    });
  },

  /**
    * Retrieve variant for currently selected options
    * @attribute selectedVariant
    * @type {Object}
  */
  get selectedVariant() {
    const variantTitle = this.selections.join(' / ');

    return this.variants.filter(variant => {
      return variant.title === variantTitle;
    })[0];
  },

  /**
    * Retrieve image for currently selected variantImage
    * @attribute selectedVariantImage
    * @type {Object}
  */
  get selectedVariantImage() {
    return this.selectedVariant.image;
  }
});

export default ProductModel;
