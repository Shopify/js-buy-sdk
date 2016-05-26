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

test('it returns the image variants for the variant', function (assert) {
  assert.expect(1);
  const expectedImageVariants = [
    {
      name: 'pico',
      dimension: '16x16',
      src: 'https://cdn.shopify.com/image-two_pico.jpg'
    },
    {
      name: 'icon',
      dimension: '32x32',
      src: 'https://cdn.shopify.com/image-two_icon.jpg'
    },
    {
      name: 'thumb',
      dimension: '50x50',
      src: 'https://cdn.shopify.com/image-two_thumb.jpg'
    },
    {
      name: 'small',
      dimension: '100x100',
      src: 'https://cdn.shopify.com/image-two_small.jpg'
    },
    {
      name: 'compact',
      dimension: '160x160',
      src: 'https://cdn.shopify.com/image-two_compact.jpg'
    },
    {
      name: 'medium',
      dimension: '240x240',
      src: 'https://cdn.shopify.com/image-two_medium.jpg'
    },
    {
      name: 'large',
      dimension: '480x480',
      src: 'https://cdn.shopify.com/image-two_large.jpg'
    },
    {
      name: 'grande',
      dimension: '600x600',
      src: 'https://cdn.shopify.com/image-two_grande.jpg'
    },
    {
      name: '1024x1024',
      dimension: '1024x1024',
      src: 'https://cdn.shopify.com/image-two_1024x1024.jpg'
    },
    {
      name: '2048x2048',
      dimension: '2048x2048',
      src: 'https://cdn.shopify.com/image-two_2048x2048.jpg'
    }
  ];

  assert.deepEqual(model.imageVariants, expectedImageVariants);
});

test('it returns the image for the variant', function (assert) {
  assert.expect(3);
  const noImageObject = {
    id: null,
    created_at: null,
    position: null,
    updated_at: null,
    product_id: null,
    src: 'https://widgets.shopifyapps.com/assets/no-image.svg',
    variant_ids: null
  };

  assert.deepEqual(model.image, baseAttrs.product.images[1]);

  model.attrs.variant.id = 'abc123';
  assert.deepEqual(model.image, baseAttrs.product.images[0], 'the first image is default when no id matches');

  model.attrs.product.images = [];
  assert.deepEqual(model.image, noImageObject);
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
