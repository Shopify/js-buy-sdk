import { module, test } from 'qunit';
import GraphModel from 'shopify-buy/graph-helpers/graph-model';

module('Unit | GraphHelpers | GraphModel');

const attrs = {
  beans: true,
  beanType: 'kidney'
};

test('it stores passed attrs under attrs', function (assert) {
  assert.expect(1);

  const model = new GraphModel(attrs);

  assert.deepEqual(model.attrs, attrs);
});

test('it creates top level proxies for all keys', function (assert) {
  assert.expect(2);

  const model = new GraphModel(attrs);

  assert.equal(model.beans, attrs.beans);
  assert.equal(model.beanType, attrs.beanType);
});

test('it creates read-only proxies', function (assert) {
  assert.expect(1);

  const model = new GraphModel(attrs);

  assert.throws(function () {
    model.beans = 'Gosh darn beans';
  });
});

test('it doesn\'t overwrite existing keys', function (assert) {
  assert.expect(3);

  class ModelWithBusinessLogic extends GraphModel {
    get beans() {
      return 'so-many';
    }
  }

  const model = new ModelWithBusinessLogic(attrs);

  assert.equal(model.beans, 'so-many');
  assert.equal(model.attrs.beans, attrs.beans);
  assert.equal(model.beanType, attrs.beanType);
});
