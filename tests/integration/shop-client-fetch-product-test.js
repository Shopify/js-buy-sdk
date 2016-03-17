import { module, test } from 'qunit';
import ShopClient from 'shopify-buy/shop-client';
import Config from 'shopify-buy/config';
import Pretender from 'pretender';
import { singleProductFixture, multipleProductsFixture } from '../fixtures/product-fixture';

const configAttrs = {
  myShopifyDomain: 'buckets-o-stuff',
  apiKey: 1,
  appId: 6
};

const config = new Config(configAttrs);

const baseUrl = `https://${configAttrs.myShopifyDomain}.myshopify.com/api/apps/${configAttrs.appId}`;

function apiUrl(path) {
  return `${baseUrl}${path}`;
}

let shopClient;
let pretender;

module('Integration | ShopClient#fetch* for products', {
  setup() {
    shopClient = new ShopClient(config);
    pretender = new Pretender();
  },
  teardown() {
    shopClient = null;
    pretender.shutdown();
  }
});


test('it resolves with an array of products on ShopClient#fetchAll', function (assert) {
  assert.expect(4);

  const done = assert.async();

  pretender.get(apiUrl('/product_listings'), function () {
    return [200, {}, JSON.stringify(multipleProductsFixture)];
  });

  shopClient.fetchAllProducts().then(products => {
    assert.ok(Array.isArray(products), 'products is an array');
    assert.equal(products.length, 2, 'there is one product in the array');
    assert.deepEqual(products[0].attrs, multipleProductsFixture.product_listings[0]);
    assert.equal(products[0].shopClient, shopClient, 'product knows its owner (the shop client)');
    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});


test('it resolves with a single product on ShopClient#fetch', function (assert) {
  assert.expect(4);

  const done = assert.async();

  const id = 1;

  pretender.get(apiUrl('/product_listings/:id'), function (request) {
    assert.equal(request.params.id, id.toString(), 'product id sent to server');

    return [200, {}, JSON.stringify(singleProductFixture)];
  });

  shopClient.fetchProduct(id).then(product => {
    assert.notOk(Array.isArray(product), 'products is not an array');
    assert.deepEqual(product.attrs, singleProductFixture.product_listing);
    assert.equal(product.shopClient, shopClient, 'product knows its owner (the shop client)');
    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});

test('it resolves with an array of products on ShopClient#fetchQuery', function (assert) {
  assert.expect(5);

  const done = assert.async();

  const id = 1;

  pretender.get(apiUrl('/product_listings'), function (request) {
    assert.equal(request.queryParams.collection_id, id.toString(), 'collection id sent to server');

    return [200, {}, JSON.stringify(multipleProductsFixture)];
  });

  shopClient.fetchQueryProducts({ collection_id: id }).then(products => {
    assert.ok(Array.isArray(products), 'products is an array');
    assert.equal(products.length, 2, 'there is one product in the array');
    assert.deepEqual(products[0].attrs, multipleProductsFixture.product_listings[0]);
    assert.equal(products[0].shopClient, shopClient, 'product knows its owner (the shop client)');
    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});
