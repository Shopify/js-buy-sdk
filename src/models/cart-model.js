import BaseModel from './base-model';
import assign from '../metal/assign';

const CartModel = BaseModel.extend({
  constructor() {
    this.super(...arguments);
  },

  get lineItems() {
    return this.attrs.line_items;
  },

  set lineItems(value) {
    this.attrs.line_items = value;

    return value;
  },

  get subTotal() {
    return this.attrs.subtotal_price;
  },

  addVariants(/* { id, quantity }, ... */) {
    const newLineItems = [...arguments].map(variant => {
      return {
        variant_id: variant.id,
        quantity: variant.quantity,
        properties: variant.properties
      };
    });
    const existingLineItems = this.lineItems;

    existingLineItems.push(...newLineItems);

    this.lineItems = existingLineItems.reduce((itemAcc, item) => {
      const matchingItem = itemAcc.filter(existingItem => {
        return (existingItem.variant_id === item.variant_id &&
                existingLineItems.properties === item.properties);
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

  updateLineItem(id, quantity) {
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

  clearLineItems() {
    this.attrs.line_items = [];

    return this.updateModel();
  },

  updateModel() {
    return this.shopClient.update('checkouts', this).then(updateCart => {
      assign(this.attrs, updateCart.attrs);

      return this;
    });
  }
});

export default CartModel;
