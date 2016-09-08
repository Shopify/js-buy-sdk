import BaseModel from './base-model';
import CartLineItem from './cart-line-item-model';
import assign from '../metal/assign';
import setGuidFor from '../metal/set-guid-for';
import globalVars from '../metal/global-vars';
import { GUID_KEY } from '../metal/set-guid-for';
import logger from '../logger';

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

/**
* Class for cart model
* @class CartModel
*/
const CartModel = BaseModel.extend({
  constructor() {
    this.super(...arguments);
  },

  /**
    * get ID for current cart
    * @property id
    * @readOnly
    * @type {String}
  */
  get id() {
    return this.attrs[GUID_KEY];
  },

  /**
    * Get current line items for cart
    * @property lineItems
    * @readOnly
    * @type {Array}
  */
  get lineItems() {
    return (this.attrs.line_items || []).map(item => {
      return new CartLineItem(item);
    });
  },

  /**
    * Gets the sum quantity of each line item
    * @property lineItemCount
    * @readOnly
    * @type {Number}
  */
  get lineItemCount() {
    return this.lineItems.reduce(function (total, item) {
      return total + item.quantity;
    }, 0);
  },

  /**
    * Get current subtotal price for all line items
    * @property subtotal
    * @readOnly
    * @type {String}
  */
  get subtotal() {
    const subtotal = this.lineItems.reduce((runningTotal, lineItem) => {
      return (runningTotal + parseFloat(lineItem.line_price));
    }, 0);

    return subtotal.toFixed(2);
  },

  /**
    * Get checkout URL for current cart
    * @property checkoutUrl
    * @readOnly
    * @type {String}
  */
  get checkoutUrl() {
    const config = this.config;
    const baseUrl = `https://${config.domain}/cart`;
    const ga = globalVars.get('ga');

    const variantPath = this.lineItems.map(item => {
      return `${item.variant_id}:${item.quantity}`;
    });

    let query = `api_key=${config.apiKey}`;

    if (typeof ga === 'function') {
      let linkerParam;

      ga(function (tracker) {
        linkerParam = tracker.get('linkerParam');
      });

      if (linkerParam) {
        query += `&${linkerParam}`;
      }
    }

    return `${baseUrl}/${variantPath}?${query}`;
  },

  /**
    * Add items to the cart. Updates cart's `lineItems` based on variants passed in.
    * ```javascript
    * cart.addVariants({variant: variantObject, quantity: 1}).then(cart => {
    *   // do things with the updated cart.
    * });
    * ```
    * @deprecated `createLineItemsFromVariants` will be used in the future as it's more descriptive
    * @method addVariants
    * @param {Object} item - One or more variants
    * @param {ProductVariantModel} item.variant - variant object
    * @param {Number} item.quantity - quantity
    * @param {Object} [moreItems...] - further objects defining `variant` and `quantity` maybe passed in
    * @public
    * @return {Promise|CartModel} - updated cart instance.
  */
  addVariants() {
    logger.warn('CartModel - ', 'addVariants is deprecated, please use createLineItemsFromVariants instead');

    return this.createLineItemsFromVariants(...arguments);
  },

  /**
    * Add items to the cart. Updates cart's `lineItems` based on variants passed in.
    * ```javascript
    * cart.addVariants({variant: variantObject, quantity: 1}).then(cart => {
    *   // do things with the updated cart.
    * });
    * ```
    * @method createLineItemsFromVariants
    * @param {Object} item - One or more variants
    * @param {ProductVariantModel} item.variant - variant object
    * @param {Number} item.quantity - quantity
    * @param {Object} [moreItems...] - further objects defining `variant` and `quantity` maybe passed in
    * @public
    * @return {Promise|CartModel} - updated cart instance.
  */
  createLineItemsFromVariants() {
    const newLineItems = [...arguments].map(item => {
      const lineItem = {
        image: item.variant.image,
        variant_id: item.variant.id,
        product_id: item.variant.productId,
        title: item.variant.productTitle,
        quantity: parseInt(item.quantity, 10),
        properties: (item.properties || {}),
        variant_title: item.variant.title,
        price: item.variant.price,
        compare_at_price: item.variant.compareAtPrice,
        grams: item.variant.grams
      };

      setGuidFor(lineItem);

      return lineItem;
    });
    const existingLineItems = this.attrs.line_items;

    existingLineItems.push(...newLineItems);

    const dedupedLineItems = existingLineItems.reduce((itemAcc, item) => {
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

    // Users may pass negative numbers and remove items. This ensures there's no
    // item with a quantity of zero or less.
    this.attrs.line_items = dedupedLineItems.reduce((itemAcc, item) => {
      if (item.quantity >= 1) {
        itemAcc.push(item);
      }

      return itemAcc;
    }, []);

    return this.updateModel();
  },

  /**
    * Update line item quantity
    * ```javascript
    * cart.updateLineItem(123, 2).then(cart => {
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
      reject(new Error(`line item with id: ${id} not found in cart#${this.id}`));
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
      this.attrs.line_items = newLineItems.map(item => {
        return item.attrs;
      });

      return this.updateModel();
    }

    return new Promise(function (resolve, reject) {
      reject(new Error(`line item with id: ${id} not found in cart#${this.id}`));
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
