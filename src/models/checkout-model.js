import BaseModel from './base-model';

const CartModel = BaseModel.extend({
  constructor() {
    this.super(...arguments);
  }
});

export default CartModel;
