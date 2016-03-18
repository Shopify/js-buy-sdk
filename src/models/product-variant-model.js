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

  get id() {
    return this.attrs.variant.id;
  },

  get productId() {
    return this.attrs.product.id;
  },

  get title() {
    return this.attrs.variant.title;
  },

  get productTitle() {
    return this.attrs.product.title;
  },

  get compareAtPrice() {
    return this.attrs.variant.compare_at_price;
  },

  get price() {
    return this.attrs.variant.price;
  },

  get grams() {
    return this.attrs.variant.grams;
  },

  get optionValues() {
    return this.attrs.variant.option_values;
  },

  get image() {
    const id = this.id;
    const images = this.attrs.product.images;

    const primaryImage = images[0];
    const variantImage = images.filter(image => {
      return image.variant_ids.indexOf(id) !== -1;
    })[0];

    return (variantImage || primaryImage);
  },

  checkoutUrl(quantity = 1) {
    const config = this.config;
    const baseUrl = `https://${config.myShopifyDomain}.myshopify.com/cart`;

    const variantPath = `${this.id}:${parseInt(quantity, 10)}`;

    const query = `api_key=${config.apiKey}`;

    return `${baseUrl}/${variantPath}?${query}`;
  }
});

export default ProductVariantModel;
