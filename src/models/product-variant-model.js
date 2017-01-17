import BaseModel from './base-model';
import ImageModel from './image-model';

/**
  * Model for product variant
  * @class ProductVariantModel
  * @constructor
*/
const ProductVariantModel = BaseModel.extend({
  constructor() {
    this.super(...arguments);
  },

  /**
    * Variant unique ID
    * @property id
    * @type {String}
  */
  get id() {
    return this.attrs.variant.id;
  },

  /**
    * ID of product variant belongs to
    * @property productId
    * @type {String}
  */
  get productId() {
    return this.attrs.product.id;
  },

  /**
    * Title of variant
    * @property title
    * @type {String}
  */
  get title() {
    return this.attrs.variant.title;
  },

  /**
    * Title of product variant belongs to
    * @property productTitle
    * @type {String}
  */
  get productTitle() {
    return this.attrs.product.title;
  },

  /**
    * Compare at price for variant. The `compareAtPrice` would be
    * the price of the product previously before the product went on sale. For more info
    * go <a href="https://docs.shopify.com/manual/products/promoting-marketing/sales" target="_blank">here</a>.
    *
    * If no `compareAtPrice` is set then this value will be `null`. An example value: `"5.00"`
    * @property compareAtPrice
    * @type {String}
  */
  get compareAtPrice() {
    return this.attrs.variant.compare_at_price;
  },


  /**
    * Price of the variant. The price will be in the following form: `"10.00"`
    *
    * @property price
    * @type {String}
  */
  get price() {
    return this.attrs.variant.price;
  },

  /**
    * Price of variant, formatted according to shop currency format string.
    * For instance `"$10.00"`
    *
    * @property formattedPrice
    * @type {String}
  */
  get formattedPrice() {
    return this.attrs.variant.formatted_price;
  },

  /**
    * Variant weight in grams. If no weight is defined grams will be `0`.
    * @property grams
    * @type {Number}
  */
  get grams() {
    return this.attrs.variant.grams;
  },

  /**
    * Option values associated with this variant. Example `optionValues`:
    * ```
    * [
    *   {
    *     "name": "Size",
    *     "option_id": 9165336518,
    *     "value": "small"
    *   },
    *   {
    *     "name": "Color",
    *     "option_id": 9640532358,
    *     "value": "blue"
    *   }
    * ]
    * ````
    *
    * @property optionValues
    * @type {Array|Object}
  */
  get optionValues() {
    return this.attrs.variant.option_values;
  },

  /**
    * Variant in stock. Always `true` if inventory tracking is disabled.
    * @property available
    * @type {Boolean}
  */
  get available() {
    return this.attrs.variant.available;
  },

  /**
    * Image for variant. An example image `Object`:
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
    * @property image
    * @type {Object}
  */
  get image() {
    const id = this.id;
    const images = this.attrs.product.images;

    const primaryImage = images[0];
    const variantImage = images.filter(image => {
      return image.variant_ids.indexOf(id) !== -1;
    })[0];

    const productImage = variantImage || primaryImage;

    if (!productImage) {
      return null;
    }

    return new ImageModel(productImage);
  },

  /**
    * Image variants available for a variant. An example value of `imageVariant`:
    * ```
    * [
    *   {
    *     "name": "pico",
    *     "dimensions": "16x16",
    *     "src": "https://cdn.shopify.com/s/files/1/1019/0495/products/alien_146ef7c1-26e9-4e96-96e6-9d37128d0005_pico.jpg?v=1469046423"
    *   },
    *   {
    *     "name": "compact",
    *     "dimensions": "160x160",
    *     "src": "https://cdn.shopify.com/s/files/1/1019/0495/products/alien_146ef7c1-26e9-4e96-96e6-9d37128d0005_compact.jpg?v=1469046423"
    *   }
    * ]
    * ```
    *
    * @property imageVariant
    * @type {Array}
  */
  get imageVariants() {
    if (!this.image) {
      return [];
    }

    return this.image.variants;
  },

  /**
    * Get a checkout url for a specific product variant. You can
    * optionally pass a quantity. If no quantity is passed then quantity
    * will default to 1. The example below will grab a checkout url for
    * 3 copies of the first variant:
    * ```
    * const checkoutURL = product.variants[ 0 ].checkoutUrl(3);
    * ```
    *
    * @method checkoutUrl
    * @param {Number} [quantity = 1] quantity of variants
    * @public
    * @return {String} Checkout URL
  */
  checkoutUrl(quantity = 1) {
    const config = this.config;
    const baseUrl = `https://${config.domain}/cart`;

    const variantPath = `${this.id}:${parseInt(quantity, 10)}`;

    const query = `api_key=${config.apiKey}`;

    return `${baseUrl}/${variantPath}?${query}`;
  }
});

export default ProductVariantModel;
