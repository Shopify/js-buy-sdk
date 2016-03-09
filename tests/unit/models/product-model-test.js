import { module, test } from 'qunit';
import ProductModel from 'buy-button-sdk/models/product-model';
import BaseModel from 'buy-button-sdk/models/base-model';
import { singleProductFixture } from '../../fixtures/product-fixture';

let model;

module('Unit | ProductModel', {
  setup() {
    model = new ProductModel(singleProductFixture.product_publications[0]);
  }
});

test('it extends from BaseModel', function (assert) {
  assert.expect(1);

  assert.ok(BaseModel.prototype.isPrototypeOf(model));
});

test('it represents options as selector-style lists', function (assert) {
  assert.expect(4);

  assert.equal(model.options[0].name, 'Size');
  assert.deepEqual(model.options[0].values, [
    'Short',
    'Long'
  ]);
  assert.equal(model.options[1].name, 'Enthusiasm');
  assert.deepEqual(model.options[1].values, [
    'Tons',
    'Less than tons'
  ]);
});

test('it sets the first variant as the `selectedVariant`', function (assert) {
  assert.expect(3);

  assert.equal(model.selectedVariant.title, 'Short / Tons');
  assert.equal(model.selectedVariant.price, '4.04');
  assert.equal(model.selectedVariant.id, 10738392513);
});

test('it sets the selectedVariantImage as the image for the selectedVariant', function (assert) {
  assert.expect(2);

  assert.equal(model.selectedVariantImage.src, 'https://cdn.shopify.com/image-one.jpg');
  assert.equal(model.selectedVariantImage.id, 7729450433);
});

test('it returns the correct variant and image when option selections change', function (assert) {
  assert.expect(5);

  model.options[0].selected = 'Long';
  model.options[1].selected = 'Less than tons';

  assert.equal(model.selectedVariant.title, 'Long / Less than tons');
  assert.equal(model.selectedVariant.price, '3.00');
  assert.equal(model.selectedVariant.id, 10738392705);

  assert.equal(model.selectedVariantImage.src, 'https://cdn.shopify.com/image-two.jpg');
  assert.equal(model.selectedVariantImage.id, 7776617601);
});

test('', function (assert) {
  assert.expect(1);

  assert.throws(function () {
    model.options[0].selected = 'Bork';
  }, new Error(`Invalid option selection for ${model.options[0].name}.`),
  'throws on invalid option');
});
