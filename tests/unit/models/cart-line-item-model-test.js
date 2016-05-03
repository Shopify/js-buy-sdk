import { module, test } from 'qunit';
import CartLineItemModel from 'shopify-buy/models/cart-line-item-model';
import BaseModel from 'shopify-buy/models/base-model';

let model;

const lineItemFixture = {
  id: 3,
  image: 'http://google.com/image.png',
  variant_id: 12345,
  product_id: 45678,
  title: 'Some Product',
  quantity: 1,
  properties: {},
  variant_title: 'Red / Small',
  price: '12.00',
  compare_at_price: '',
  line_price: '12.00',
  grams: 4
};

module('Unit | CartLineItemModel', {
  setup() {
    model = new CartLineItemModel(lineItemFixture);
  },

  teardown() {
    model = null;
  }
});

test('it extends from BaseModel', function (assert) {
  assert.expect(1);

  assert.ok(BaseModel.prototype.isPrototypeOf(model));
});

test('it updates line_price based on changing quantity', function (assert) {
  assert.expect(/* Add a value here */);
});

