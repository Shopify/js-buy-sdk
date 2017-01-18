import { module, test } from 'qunit';
import ImageModel from 'shopify-buy/models/image-model';
import CoreObject from 'shopify-buy/metal/core-object';
import { singleProductFixture } from '../../fixtures/product-fixture';

let model;

const config = {};

module('Unit | ImageModel', {
  setup() {
    model = new ImageModel(singleProductFixture.product_listing.images[0], { config });
  }
});

test('it extends from CoreObject', function (assert) {
  assert.expect(1);

  assert.ok(CoreObject.prototype.isPrototypeOf(model));
});

test('it copies attrs to properties', function (assert) {
  assert.expect(5);
  assert.equal(model.src, singleProductFixture.product_listing.images[0].src);
  assert.equal(model.created_at, singleProductFixture.product_listing.images[0].created_at);
  assert.deepEqual(model.variant_ids, singleProductFixture.product_listing.images[0].variant_ids);
  assert.equal(model.product_id, singleProductFixture.product_listing.images[0].product_id);
  assert.equal(model.position, singleProductFixture.product_listing.images[0].position);
});

test('it populates image variants', function (assert) {
  assert.expect(2);
  assert.equal(model.variants.length, 10);
  assert.deepEqual(model.variants[0], {
    name: 'pico',
    dimension: '16x16',
    src: 'https://cdn.shopify.com/image-one_pico.jpg'
  });
});
