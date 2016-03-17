import { module, test } from 'qunit';
import ProductVariantModel from 'shopify-buy/models/product-variant-model';
import BaseModel from 'shopify-buy/models/base-model';
import assign from 'shopify-buy/metal/assign';

let model;

const baseAttrs = {
  product: {
    id: 5123170945,
    title: 'Aluminum Pole',
    images: [
      {
        id: 7729450433,
        position: 1,
        product_id: 3677189889,
        src: 'https://cdn.shopify.com/image-one.jpg',
        variant_ids: []
      },
      {
        id: 7776617601,
        position: 2,
        product_id: 3677189889,
        src: 'https://cdn.shopify.com/image-two.jpg',
        variant_ids: [
          10738392705
        ]
      }
    ]
  },
  variant: {
    id: 10738392705,
    title: 'Long / Less than tons',
    compare_at_price: null,
    price: '3.00',
    grams: 1000,
    option_values: [
      {
        option_id: 4442617025,
        name: 'Size',
        value: 'Long'
      },
      {
        option_id: 4442617089,
        name: 'Enthusiasm',
        value: 'Less than tons'
      }
    ]
  }
};

module('Unit | ProductVariantModel', {
  setup() {
    model = new ProductVariantModel(assign({}, baseAttrs));
  }
});

test('it extends from BaseModel', function (assert) {
  assert.expect(1);

  assert.ok(BaseModel.prototype.isPrototypeOf(model));
});

test('it proxies to a composite of product and variant state', function (assert) {
  assert.expect(8);

  assert.equal(model.id, baseAttrs.variant.id);
  assert.equal(model.productId, baseAttrs.product.id);
  assert.equal(model.title, baseAttrs.variant.title);
  assert.equal(model.productTitle, baseAttrs.product.title);
  assert.equal(model.compareAtPrice, baseAttrs.variant.compare_at_price);
  assert.equal(model.price, baseAttrs.variant.price);
  assert.equal(model.grams, baseAttrs.variant.grams);
  assert.deepEqual(model.optionValues, baseAttrs.variant.option_values);
});

test('it returns the image for the variant', function (assert) {
  assert.expect(2);

  assert.deepEqual(model.image, baseAttrs.product.images[1]);

  model.attrs.variant.id = 'abc123';

  assert.deepEqual(model.image, baseAttrs.product.images[0], 'the first image is default when no id matches');
});
