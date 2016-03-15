import BaseModel from './base-model';
import assign from '../metal/assign';

function objectsEqual(one, two) {
  if (one === two) {
    return true;
  }

  return Object.keys(one).every(key => {
    if (one[key] instanceof Date) {
      return one[key].toString() === two[key].toString();
    } else if (typeof one[key] === 'object') {
      return objectsEqual(one[key], two[key]);
    }

    return one[key] === two[key];
  });
}
const CartModel = BaseModel.extend({

  /**
    * Class for cart model
    * @class CartModel
    * @constructor
  */
  constructor() {
    this.super(...arguments);
  },

  /**
    * Get current line items for cart
    * @property lineItems
    * @type {Array}
  */
  get lineItems() {
    return this.attrs.line_items;
  },

  /**
    * Get current subtotal price for all line items
    * @property subTotal
    * @type {String}
  */
  get subTotal() {
    return this.attrs.subtotal_price;
  },

  /**
    * Add items to cart. Updates cart's `lineItems`
    * ```javascript
    * cart.addVariants({id: 123, quantity: 1}).then(cart => {
    *   // do things with the updated cart.
    * });
    * ```
    * @method addVariants
    * @param {Object} variant - One or more variants
    * @param {Number} variant.id - variant ID
    * @param {Number} variant.quantity - quantity
    * @param {Object} [variant2...] - further variants may also be passed
    * @public
    * @return {Promise|CartModel} - updated cart instance.
  */
  addVariants() {
    const newLineItems = [...arguments].map(variant => {
      return {
        variant_id: variant.id,
        quantity: variant.quantity,
        properties: variant.properties
      };
    });
    const existingLineItems = this.lineItems;

    existingLineItems.push(...newLineItems);

    this.attrs.line_items = existingLineItems.reduce((itemAcc, item) => {
      const matchingItem = itemAcc.filter(existingItem => {
        return (existingItem.variant_id === item.variant_id &&
                objectsEqual(existingItem.properties, item.properties));
      })[0];

      if (matchingItem) {
        matchingItem.quantity = matchingItem.quantity + item.quantity;
      } else {
        itemAcc.push(item);
      }

      return itemAcc;
    }, []);

    return this.updateModel();
  },

  /**
    * Update line item quantity
    * ```javascript
    * cart.updateLineItem(123, 2}).then(cart => {
    *   // do things with the updated cart.
    * });
    * ```
    * @method updateLineItem
    * @param {Number} id - line item ID
    * @param {Number} quantity - new quantity for line item
    * @throws {Error} if line item with ID is not in cart.
    * @public
    * @return {Promise|CartModel} - updated cart instance
  */
  updateLineItem(id, quantity) {
    if (quantity < 1) {
      return this.removeLineItem(id);
    }

    const lineItem = this.lineItems.filter(item => {
      return item.id === id;
    })[0];

    if (lineItem) {
      lineItem.quantity = quantity;

      return this.updateModel();
    }

    return new Promise(function (resolve, reject) {
      reject(new Error(`line item with id: ${id} not found in cart#${this.attrs.token}`));
    });
  },

  /**
    * Remove line item from cart
    * @method removeLineItem
    * @param {Number} id - line item ID
    * @throws {Error} if line item with ID is not in cart.
    * @public
    * @return {Promise|CartModel} - updated cart instance
  */
  removeLineItem(id) {
    const oldLength = this.lineItems.length;
    const newLineItems = this.lineItems.filter(item => {
      return item.id !== id;
    });
    const newLength = newLineItems.length;

    if (newLength < oldLength) {
      this.attrs.line_items = newLineItems;

      return this.updateModel();
    }

    return new Promise(function (resolve, reject) {
      reject(new Error(`line item with id: ${id} not found in cart#${this.attrs.token}`));
    });
  },

  /**
    * Remove all line items from cart
    * @method clearLineItems
    * @public
    * @return {Promise|CartModel} - updated cart instance
  */
  clearLineItems() {
    this.attrs.line_items = [];

    return this.updateModel();
  },

  /**
    * force update of cart model on server
    * @method updateModel
    * @public
    * @return {Promise|CartModel} - updated cart instance
  */
  updateModel() {
    return this.shopClient.update('carts', this).then(updateCart => {
      assign(this.attrs, updateCart.attrs);

      return this;
    });
  }
});

export default CartModel;
