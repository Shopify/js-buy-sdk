import BaseModel from './base-model';
import CoreObject from '../metal/core-object';
import uniq from '../metal/uniq';
import includes from '../metal/includes';

const Option = CoreObject.extend({
  constructor(name, values) {
    this.name = name;
    this.values = values;
    this.selected = values[0];
  },

  name: '',

  values: [],

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

const ProductModel = BaseModel.extend({
  constructor() {
    this.super(...arguments);
  },

  get memoized() {
    this._memoized = this._memoized || {};

    return this._memoized;
  },

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

  get selections() {
    return this.options.map(option => {
      return option.selected;
    });
  },

  get selectedVariant() {
    const variantTitle = this.selections.join(' / ');

    return this.attrs.variants.filter(variant => {
      return variant.title === variantTitle;
    })[0];
  },

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
