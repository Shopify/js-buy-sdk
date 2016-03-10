import { module, test } from 'qunit';
import BaseModel from 'js-buy-sdk/models/base-model';
import CoreObject from 'js-buy-sdk/metal/core-object';

module('Unit | BaseModel');

test('it extends from CoreObject', function (assert) {
  const model = new BaseModel();

  assert.ok(CoreObject.prototype.isPrototypeOf(model));
});

test('it attaches attrs to `.attrs`', function (assert) {
  const attrs = { someAttr: 'some-attr' };
  const model = new BaseModel(attrs);

  assert.deepEqual(model.attrs, attrs);
});

test('it attaches metaAttrs to the root', function (assert) {
  const metaAttrs = { someAttr: 'some-attr' };
  const model = new BaseModel({}, metaAttrs);

  assert.equal(model.someAttr, metaAttrs.someAttr);
});
