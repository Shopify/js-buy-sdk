import { module, test } from 'qunit';
import BaseModel from 'shopify-buy/models/base-model';
import ReferenceModel from 'shopify-buy/models/reference-model';

module('Unit | ReferenceModel');

test('it extends from BaseModel', function (assert) {
  const model = new ReferenceModel({ referenceId: 'whatever' });

  assert.ok(BaseModel.prototype.isPrototypeOf(model));
});

test('it attaches attrs to `.attrs`', function (assert) {
  const attrs = { someAttr: 'some-attr', referenceId: 'whatever' };
  const model = new ReferenceModel(attrs);

  assert.deepEqual(model.attrs, attrs);
});

test('it attaches metaAttrs to the root', function (assert) {
  const metaAttrs = { someAttr: 'some-attr' };
  const model = new ReferenceModel({ referenceId: 'whatever' }, metaAttrs);

  assert.equal(model.someAttr, metaAttrs.someAttr);
});

test('it throws when a reference id is missing', function (assert) {
  assert.throws(function () {
    /* eslint no-unused-vars: 0 */
    const model = new ReferenceModel({});
  }, 'missing referenceId param throws');
});

test('it attaches proxies referenceId to attrs', function (assert) {
  const referenceId = 'whatever';
  const model = new ReferenceModel({ referenceId });

  assert.equal(model.referenceId, referenceId);

  const newId = 'some-value';

  model.referenceId = newId;

  assert.equal(model.referenceId, newId);
});
