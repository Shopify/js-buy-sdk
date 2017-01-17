import BaseModel from './base-model';
import ProductOptionModel from './product-option-model';
import ProductVariantModel from './product-variant-model';
import ImageModel from './image-model';
import uniq from '../metal/uniq';

const NO_IMAGE_URI = 'https://widgets.shopifyapps.com/assets/no-image.svg';

/**
   * Class for products returned by fetch('product')
   * @class ProductModel
   * @constructor
 */
const ProductModel = BaseModel.extend({
  constructor() {
    this.super(...arguments);
  },

  /**
    * Product unique ID
    *
    * @property id
    * @type {String}
  */
  get id() {
    return this.attrs.product_id;
  },

  /**
    * The product title
    * @property title
    * @type {String}
  */
  get title() {
    return this.attrs.title;
  },

  /**
    * A product description.
    * @property description
    * @type {String}
  */
  get description() {
    return this.attrs.body_html;
  },

  /**
    * An `Array` of `Objects` that contain meta data about an image including `src` of the images.
    *
    * An example image `Object`:
    * ```
    * {
    *   created_at: "2016-08-29T12:35:09-04:00",
    *   id: 17690553350,
    *   position: 1,
    *   product_id: 8291029446,
    *   src: "https://cdn.shopify.com/s/files/1/1019/0495/products/i11_c3334325-2d67-4623-8cd4-0a6b08aa1b83.jpg?v=1472488509",
    *   updated_at: "2016-08-29T12:35:09-04:00",
    *   variant_ids: [ 27690103238 ]
    * }
    * ```
    * @property images
    * @type {Array} array of image objects.
  */
  get images() {
    return this.attrs.images.map(image => {
      return new ImageModel(image);
    });
  },

  get memoized() {
    this._memoized = this._memoized || {};

    return this._memoized;
  },

  /**
   *  Get an array of {{#crossLink "ProductOptionModel"}}ProductOptionModels{{/crossLink}}.
   *  {{#crossLink "ProductOptionModel"}}ProductOptionModels{{/crossLink}} can be used to
   *  define the currently `selectedVariant` from which you can get a checkout url
   *  ({{#crossLink "ProductVariantModel/checkoutUrl"}}ProductVariantModel.checkoutUrl{{/crossLink}}) or can
   *  be added to a cart ({{#crossLink "CartModel/createLineItemsFromVariants"}}CartModel.createLineItemsFromVariants{{/crossLink}}).
   *
   *  Below is an example on how to create html for option selections:
   * ```javascript
   *  // the following will create an Array of HTML to create multiple select inputs
   *  // global callbacks are also created which will set the option as selected
   *  var elements = product.options.map(function(option) {
   *    // we'll create a callback in global scope
   *    // which will be called when the select's value changes
   *    var callBackName = option.name + 'onChange';
   *    window[ callBackName ] = function(select) {
   *      // set the products option to be selected
   *      option.selected = select.value;
   *    };
   *
   *    // return a string which will be HTML for the select
   *    return '<select name="' + option.name + '" onchange="'callBackName'(this)">' + option.values.map(function(value) {
   *      return '<option value="' + value + '">' + value + '</option>';
   *    }) + '</select>';
   *  });
   * ```
   *
   * @property options
   * @type {Array|ProductOptionModel}
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

  /**
    * An `Array` of {{#crossLink "ProductVariantModel"}}ProductVariantModel's{{/crossLink}}
    * @property variants
    * @type {Array|ProductVariantModel} array of ProductVariantModel instances.
  */
  get variants() {
    return this.attrs.variants.map(variant => {
      return new ProductVariantModel({ variant, product: this }, { config: this.config });
    });
  },

  /**
    * A read only `Array` of Strings represented currently selected option values. eg. `["Large", "Red"]`
    * @property selections
    * @type {Array | String}
  */
  get selections() {
    return this.options.map(option => {
      return option.selected;
    });
  },

  /**
    * Retrieve variant for currently selected options. By default the first value in each
    * option is selected which means `selectedVariant` will never be `null`.
    *
    * With a `selectedVariant` you can create checkout url
    * ({{#crossLink "ProductVariantModel/checkoutUrl"}}ProductVariantModel.checkoutUrl{{/crossLink}}) or it can
    * be added to a cart ({{#crossLink "CartModel/createLineItemsFromVariants"}}CartModel.createLineItemsFromVariants{{/crossLink}}).
    *
    * @property selectedVariant
    * @type {ProductVariantModel}
  */
  get selectedVariant() {
    const variantTitle = this.selections.join(' / ');

    return this.variants.filter(variant => {
      return variant.title === variantTitle;
    })[0] || null;
  },

  /**
    * Retrieve image for currently selected variantImage. An example image Object would look like this:
    * ```
    * {
    *   created_at: "2016-08-29T12:35:09-04:00",
    *   id: 17690553350,
    *   position: 1,
    *   product_id: 8291029446,
    *   src: "https://cdn.shopify.com/s/files/1/1019/0495/products/i11_c3334325-2d67-4623-8cd4-0a6b08aa1b83.jpg?v=1472488509",
    *   updated_at: "2016-08-29T12:35:09-04:00",
    *   variant_ids: [ 27690103238 ]
    * }
    * ```
    *
    * @property selectedVariantImage
    * @type {Object}
  */
  get selectedVariantImage() {
    if (!this.selectedVariant) {
      return null;
    }

    return this.selectedVariant.image;
  }
});

export default ProductModel;
export { NO_IMAGE_URI };
