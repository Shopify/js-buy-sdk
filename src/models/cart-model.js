import BaseModel from './base-model';
import assign from '../metal/assign';

function mergeModel(updateCart) {
  assign(this.attrs, updateCart.attrs);

  return this;
}

const CartModel = BaseModel.extend({
  constructor() {
    this.super(...arguments);
  },

  get lineItems() {
    return this.attrs.line_items;
  },

  get subTotal() {
    return this.attrs.subtotal_price;
  },

  addVariants(/* { id, quantity }, ... */) {
    this.lineItems.push(...arguments);

    return this.shopClient.update('checkouts', this).then(mergeModel.bind(this));
  },

  updateLineItem(id, quantity) {
    const lineItem = this.lineItems.filter(item => {
      return item.id === id;
    })[0];

    if (lineItem) {
      lineItem.quantity = quantity;

      return this.shopClient.update('checkouts', this).then(mergeModel.bind(this));
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

      return this.shopClient.update('checkouts', this).then(mergeModel.bind(this));
    }

    return new Promise(function (resolve, reject) {
      reject(new Error(`line item with id: ${id} not found in cart#${this.attrs.token}`));
    });
  },

  clearLineItems() {
    this.attrs.line_items = [];

    return this.shopClient.update('checkouts', this).then(mergeModel.bind(this));
  }
});

export default CartModel;
