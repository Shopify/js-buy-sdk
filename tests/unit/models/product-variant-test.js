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
    ],
    image: {
      imageVariants: [
        {
          name: 'thumb',
          dimensions: '50x50',
          src: 'https://cdn.shopify.com/image-two_thumb.jpg'
        },
        {
          name: 'small',
          dimensions: '100x100',
          src: 'https://cdn.shopify.com/image-two_small.jpg'
        },
        {
          name: 'master',
          dimensions: '100x100',
          src: 'https://cdn.shopify.com/image-two_small.jpg'
        }
      ]
    }
  }
};

const config = {
  myShopifyDomain: 'buckets-o-stuff',
  apiKey: 'abc123'
};

module('Unit | ProductVariantModel', {
  setup() {
    model = new ProductVariantModel(assign({}, baseAttrs), { config });
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

  assert.deepEqual(model.image, baseAttrs.variant.image.imageVariants[2], 'should return the `master` when no type is specified');
  assert.deepEqual(model.image('small'), baseAttrs.variant.image.imageVariants[1], 'should return the `small` image');
  assert.deepEqual(model.image('stupid-name'), baseAttrs.variant.image.imageVariants[2], 'should return `master` image for invalid type');

  model.attrs.variant.image = null;
  assert.deepEqual(model.image, baseAttrs.product.images[1], 'should return product level image for variant');

  model.attrs.variant.id = 'abc123';
  assert.deepEqual(model.image, baseAttrs.product.images[0], 'should return product default image when no id matches');
});

test('it generates checkout permalinks from passed quantity', function (assert) {
  assert.expect(4);

  const baseUrl = `https://${config.myShopifyDomain}.myshopify.com/cart`;
  const query = `api_key=${config.apiKey}`;

  assert.equal(model.checkoutUrl(), `${baseUrl}/${model.id}:1?${query}`, 'defaults to 1');
  assert.equal(model.checkoutUrl(27), `${baseUrl}/${model.id}:27?${query}`, 'respects passed quantity');
  assert.equal(model.checkoutUrl('3'), `${baseUrl}/${model.id}:3?${query}`, 'works with strings');
  assert.equal(model.checkoutUrl(5.5), `${baseUrl}/${model.id}:5?${query}`, 'trims decimals');
});
