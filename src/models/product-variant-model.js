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
    return this.scaledImage();
  },

  /**
    * Gets image corresponding to a specific size.
    * Available sizes are listed at https://help.shopify.com/themes/liquid/filters/url-filters#size-parameters
    * @method scaledImage
    * @param {String} [size = 'master'] Desired size. Defaults to `master` when available and to product image when unavailable.
    * @public
    * @return {String} Checkout URL
  */
  scaledImage(size = 'master') {
    const id = this.id;
    const productImages = this.attrs.product.images;

    if (this.attrs.variant.image) {
      const candidates = this.attrs.variant.image.imageVariants.filter(element => {
        return element.name === size || element.name === 'master';
      });

      if (candidates.length === 1) {
        return candidates[0];
      } else if (candidates[0].name === size) {
        return candidates[0];
      }

      return candidates[1];
    }

    const primaryImage = productImages[0];
    const variantImage = productImages.filter(image => {
      return image.variant_ids.indexOf(id) !== -1;
    })[0];

    return (variantImage || primaryImage);
  },

  /**
    * Checkout URL for purchasing variant with quantity.
    * @method checkoutUrl
    * @param {Number} [quantity = 1] quantity of variant
    * @public
    * @return {String} Checkout URL
  */
  checkoutUrl(quantity = 1) {
    const config = this.config;
    const baseUrl = `https://${config.myShopifyDomain}.myshopify.com/cart`;

    const variantPath = `${this.id}:${parseInt(quantity, 10)}`;

    const query = `api_key=${config.apiKey}`;

    return `${baseUrl}/${variantPath}?${query}`;
  }
});

export default ProductVariantModel;
