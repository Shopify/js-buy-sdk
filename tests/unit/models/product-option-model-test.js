import { module, test } from 'qunit';
import ProductOptionModel from 'js-buy-sdk/models/product-option-model';
import BaseModel from 'js-buy-sdk/models/base-model';

let model;

const optionAttrs = { name: 'Size', values: ['Large', 'Small'] };

module('Unit | ProductOptionModel', {
  setup() {
    model = new ProductOptionModel(optionAttrs);
  }
});

test('it extends from BaseModel', function (assert) {
  assert.expect(1);

  assert.ok(BaseModel.prototype.isPrototypeOf(model));
});

test('it proxies the passed in state', function (assert) {
  assert.expect(2);

  assert.equal(model.name, optionAttrs.name);
  assert.deepEqual(model.values, optionAttrs.values);
});

test('it defaults selected to the first option-value', function (assert) {
  assert.expect(1);

  assert.equal(model.selected, optionAttrs.values[0]);
});

test('it allows setting of selected no an option value', function (assert) {
  assert.expect(1);

  model.selected = optionAttrs.values[1];
  assert.equal(model.selected, optionAttrs.values[1]);
});

test('it throws when selected is set to an invalid value', function (assert) {
  assert.expect(1);

  assert.throws(function () {
    model.selected = 'Beans';
  }, new Error('Invalid option selection for Size.'));
});
