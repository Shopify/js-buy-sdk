import BaseModel from './base-model';
import GUID_KEY from '../metal/guid-key';

/**
 * A cart stores an Array of `CartLineItemModel`'s in it's `lineItems` property.
 * @class CartLineItemModel
 * @constructor
 */
const CartLineItemModel = BaseModel.extend({
  constructor() {
    this.super(...arguments);
  },

  /**
   * A line item ID.
   * @property id
   * @readOnly
   * @type {String}
   */
  get id() {
    return this.attrs[GUID_KEY];
  },

  /**
   * ID of line item variant.
   * @property variant_id
   * @readOnly
   * @type {String}
   */
  get variant_id() {
    return this.attrs.variant_id;
  },

  /**
   * ID of variant's product.
   * @property product_id
   * @readOnly
   * @type {String}
   */
  get product_id() {
    return this.attrs.product_id;
  },

  /**
   * Variant's image.
   * Example `Object` returned:
   * ```
   * {
   *    "id": 18723183238,
   *    "created_at": "2016-09-14T17:12:12-04:00",
   *    "position": 1,
   *    "updated_at": "2016-09-14T17:12:12-04:00",
   *    "product_id": 8569911558,
   *    "src": "https://cdn.shopify.com/s/files/1/1019/0495/products/Mop__three_different_mop_handles.jpg?v=1473887532",
   *    "variant_ids": []
   *  }
   * ```
   * @property image
   * @readOnly
   * @type {Object}
   */
  get image() {
    return this.attrs.image;
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
    return this.attrs.image_variants;
  },

  /**
   * Product title of variant's parent product.
   * @property title
   * @readOnly
   * @type {String}
   */
  get title() {
    return this.attrs.title;
  },

  /**
   * Count of variants to order.
   * @property quantity
   * @type {Number}
   */
  get quantity() {
    return this.attrs.quantity;
  },

  set quantity(value) {
    const parsedValue = parseInt(value, 10);

    if (parsedValue < 0) {
      throw new Error('Quantities must be positive');
    } else if (parsedValue !== parseFloat(value)) {
      /* incidentally, this covers all NaN values, because NaN !== Nan */
      throw new Error('Quantities must be whole numbers');
    }

    this.attrs.quantity = parsedValue;

    return this.attrs.quantity;
  },

  /**
   * Customization information for a product.
   * <a href="https://help.shopify.com/themes/customization/products/get-customization-information-for-products" target="_blank">
   * See here for more info
   * </a>.
   * @property properties
   * @type {Object}
   * @private
   */
  get properties() {
    return this.attrs.properties || {};
  },

  set properties(value) {
    this.attrs.properties = value || {};

    return value;
  },

  /**
   * Title of variant.
   * @property variant_title
   * @readOnly
   * @type {String}
   */
  get variant_title() {
    return this.attrs.variant_title;
  },

  /**
   * Price of the variant. For example: `"5.00"`.
   * @property price
   * @readOnly
   * @type {String}
   */
  get price() {
    return this.attrs.price;
  },

  /**
    * Compare at price for variant. The `compareAtPrice` would be
    * the price of the product previously before the product went on sale. For more info
    * go <a href="https://docs.shopify.com/manual/products/promoting-marketing/sales" target="_blank">here</a>.
    *
    * If no `compareAtPrice` is set then this value will be `null`. An example value: `"5.00"`.
    * @property compareAtPrice
    * @readOnly
    * @type {String}
  */
  get compare_at_price() {
    return this.attrs.compare_at_price;
  },

  /**
   * The total price for this line item. For instance if the variant costs `1.50` and you have a quantity
   * of 2 then `line_price` will be `3.00`.
   * @property line_price
   * @readOnly
   * @type {String}
   */
  get line_price() {
    return (this.quantity * parseFloat(this.price)).toFixed(2);
  },

  /**
   * Variant's weight in grams. If no weight is set then `0` is returned.
   * @property grams
   * @readOnly
   * @type {Number}
   */
  get grams() {
    return this.attrs.grams;
  }
});

export default CartLineItemModel;
