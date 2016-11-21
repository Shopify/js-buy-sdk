import { module, test } from 'qunit';
import CartLineItemModel from 'shopify-buy/models/cart-line-item-model';
import assign from 'shopify-buy/metal/assign';
import GUID_KEY from 'shopify-buy/metal/guid-key';
import BaseModel from 'shopify-buy/models/base-model';

let model;

const lineItemFixture = {
  image: 'http://google.com/image.png',
  image_variants: [
    'http://google.com/image.png',
  ],
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

lineItemFixture[GUID_KEY] = 5;

module('Unit | CartLineItemModel', {
  setup() {
    model = new CartLineItemModel(assign({}, lineItemFixture));
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
  assert.expect(6);

  assert.equal(model.quantity, 1);
  assert.equal(model.price, '12.00');
  assert.equal(model.line_price, '12.00');

  model.quantity = 2;

  assert.equal(model.quantity, 2);
  assert.equal(model.price, '12.00');
  assert.equal(model.line_price, '24.00');
});

test('it updates line_price if quantity is a numeric string', function (assert) {
  assert.expect(6);

  assert.equal(model.quantity, 1);
  assert.equal(model.price, '12.00');
  assert.equal(model.line_price, '12.00');

  model.quantity = '2';

  assert.equal(model.quantity, 2, 'quantity gets cast to a number');
  assert.equal(model.price, '12.00');
  assert.equal(model.line_price, '24.00');
});

test('it rejects negative quantities', function (assert) {
  assert.expect(1);

  assert.throws(function () {
    model.quantity = -1;
  });
});

test('it rejects decimal quantities', function (assert) {
  assert.expect(2);

  assert.throws(function () {
    model.quantity = 1.5;
  });

  assert.throws(function () {
    model.quantity = '1.5';
  });
});

test('it rejects things that are in no way numbers', function (assert) {
  assert.expect(6);

  assert.throws(function () {
    model.quantity = '';
  });

  assert.throws(function () {
    model.quantity = null;
  });

  assert.throws(function () {
    model.quantity = true;
  });

  assert.throws(function () {
    model.quantity = false;
  });

  assert.throws(function () {
    model.quantity = NaN;
  });

  assert.throws(function () {
    /* eslint no-undefined: 0 */
    model.quantity = undefined;
  });
});

test('it proxies values in attrs that we would like to expose', function (assert) {
  assert.expect(10);

  assert.equal(model.id, model.attrs[GUID_KEY]);
  assert.equal(model.variant_id, model.attrs.variant_id);
  assert.equal(model.product_id, model.attrs.product_id);
  assert.equal(model.image, model.attrs.image);
  assert.equal(model.imageVariants, model.attrs.image_variants);
  assert.equal(model.title, model.attrs.title);
  assert.equal(model.variant_title, model.attrs.variant_title);
  assert.equal(model.price, model.attrs.price);
  assert.equal(model.compare_at_price, model.attrs.compare_at_price);
  assert.equal(model.grams, model.attrs.grams);
});
