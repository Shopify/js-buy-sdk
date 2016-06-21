import { module, test } from 'qunit';
import ProductModel, { NO_IMAGE_URI } from 'shopify-buy/models/product-model';
import BaseModel from 'shopify-buy/models/base-model';
import { singleProductFixture } from '../../fixtures/product-fixture';

let model;

const config = {};

module('Unit | ProductModel', {
  setup() {
    model = new ProductModel(singleProductFixture.product_listing, { config });
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

test('it proxies attrs for most commonly used props', function (assert) {
  assert.expect(4);

  assert.equal(model.id, singleProductFixture.product_listing.product_id);
  assert.equal(model.title, singleProductFixture.product_listing.title);
  assert.deepEqual(model.images, singleProductFixture.product_listing.images);

  // Variants are now rich models, so we just want to guarantee that same-state
  // is represented.
  function condenseVariant(variant) {
    return {
      id: variant.id,
      title: variant.title,
      price: variant.price
    };
  }

  assert.deepEqual(
    model.variants.map(condenseVariant),
    singleProductFixture.product_listing.variants.map(condenseVariant)
  );
});

test('it attaches a reference to the config on variants', function (assert) {
  assert.expect(singleProductFixture.product_listing.variants.length + 1);

  assert.ok(singleProductFixture.product_listing.variants.length > 0, 'this test requires the fixture have variants');

  model.variants.forEach(variant => {
    assert.equal(variant.config, config);
  });
});

test('it returns Shopify admin\'s no image URI', function (assert) {
  assert.expect(1);

  assert.equal(NO_IMAGE_URI, 'https://widgets.shopifyapps.com/assets/no-image.svg');
});

test('it returns null variant when there is no matching variant based on the selections', function (assert) {
  assert.expect(1);

  model.options[0].values.push('beans');
  model.options[1].values.push('beans');

  model.options[0].selected = 'beans';
  model.options[1].selected = 'beans';

  assert.equal(model.selectedVariant, null);
});

test('it returns a null image when there is no selected variant', function (assert) {
  assert.expect(1);

  model.options[0].values.push('beans');
  model.options[1].values.push('beans');

  model.options[0].selected = 'beans';
  model.options[1].selected = 'beans';

  assert.equal(model.selectedVariantImage, null);
});

test('it returns valid description in description', function (assert) {
  assert.expect(1);

  assert.equal(model.description, singleProductFixture.product_listing.body_html);
});
