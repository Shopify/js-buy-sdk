import BaseModel from './base-model';


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
    * <a href="https://docs.shopify.com/manual/products/promoting-marketing/sales">
    * Compare at</a> price for variant formatted as currency.
    * @property compareAtPrice
    * @type {String}
  */
  get compareAtPrice() {
    return this.attrs.variant.compare_at_price;
  },


  /**
    * Price of variant, formatted as currency
    * @property price
    * @type {String}
  */
  get price() {
    return this.attrs.variant.price;
  },

  /**
    * Variant weight in grams
    * @property grams
    * @type {Number}
  */
  get grams() {
    return this.attrs.variant.grams;
  },

  /**
    * Option values associated with this variant, ex {name: "color", value: "Blue"}
    * @property optionValues
    * @type {Array|Object}
  */
  get optionValues() {
    return this.attrs.variant.option_values;
  },

  /**
    * Image for variant
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

    return (variantImage || primaryImage);
  },

  /**
    * Checkout URL for purchasing variant with quantity.
    * @method checkoutUrl
    * @param {Object} [{quantity: 1}] an options object, contains quantity by
    * default.
    * @public
    * @return {String} Checkout URL
  */
  checkoutUrl(opts = { quantity: 1 }) {

    if (Object.keys(opts).length === 0) {
      opts.quantity = 1;
    }

    const config = this.config;
    const baseUrl = `https://${config.myShopifyDomain}.myshopify.com/cart`;

    const quantity = parseInt(opts.quantity, 10);
    const variantPath = `${this.id}:${quantity}`;

    const query = `api_key=${config.apiKey}`;

    return `${baseUrl}/${variantPath}?${query}`;
  }
});

export default ProductVariantModel;
