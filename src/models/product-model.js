import BaseModel from './base-model';
import CoreObject from '../metal/core-object';
import uniq from '../metal/uniq';
import includes from '../metal/includes';

/**
  * Class for product option
  * @class Option
  * @constructor
*/
const Option = CoreObject.extend({
  constructor(name, values) {
    this.name = name;
    this.values = values;
    this.selected = values[0];
  },

  /**
    * name of option (ex. "Size", "Color")
    * @property name
    * @type String
  */
  name: '',

  /**
    * possible values for selection
    * @property values
    * @type Array
  */
  values: [],

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
    if (includes(this.values, value)) {
      this._selected = value;
    } else {
      throw new Error(`Invalid option selection for ${this.name}.`);
    }

    return value;
  }
});

/**
   * Class for products returned by fetch('product')
   * @class ProductModel
   * @constructor
 */

const ProductModel = BaseModel.extend({
  constructor() {
    this.super(...arguments);
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
    const variants = this.attrs.variants;

    this.memoized.options = baseOptions.map(option => {
      const name = option.name;

      const dupedValues = variants.reduce((valueList, variant) => {
        const optionValueForOption = variant.option_values.filter(optionValue => {
          return optionValue.name === option.name;
        })[0];

        valueList.push(optionValueForOption.value);

        return valueList;
      }, []);

      const values = uniq(dupedValues);

      return new Option(name, values);
    });

    return this.memoized.options;
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

    return this.attrs.variants.filter(variant => {
      return variant.title === variantTitle;
    })[0];
  },

  /**
    * Retrieve image for currently selected variantImage
    * @attribute selectedVariantImage
    * @type {Object}
  */
  get selectedVariantImage() {
    const selectedVariantId = this.selectedVariant.id;
    const images = this.attrs.images;
    const primaryImage = images[0];
    const variantImage = images.filter(image => {
      return image.variant_ids.indexOf(selectedVariantId) !== -1;
    })[0];

    return (variantImage || primaryImage);
  }
});

export default ProductModel;
