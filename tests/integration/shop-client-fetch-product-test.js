import { module, test } from 'qunit';
import ShopClient from 'js-buy-sdk/shop-client';
import Config from 'js-buy-sdk/config';
import Pretender from 'pretender';

const configAttrs = {
  myShopifyDomain: 'buckets-o-stuff',
  apiKey: 1,
  channelId: 'abc123'
};

const config = new Config(configAttrs);

const baseUrl = `https://${configAttrs.myShopifyDomain}.myshopify.com/api/channels/${configAttrs.channelId}`;

function apiUrl(path) {
  return `${baseUrl}${path}`;
}

const productsFixture = {
  product_publications: [
    {
      id: 5123171009,
      product_id: 3680886721,
      channel_id: 40889985,
      created_at: '2016-01-05T11:32:26-05:00',
      updated_at: '2016-01-05T11:32:26-05:00',
      body_html: 'Why would you buy this?',
      handle: 'electricity-socket-with-jam',
      product_type: '',
      title: 'Electricity socket with jam',
      vendor: 'buckets-o-stuff',
      published_at: '2016-01-05T11:32:26-05:00',
      published: true,
      available: true,
      tags: '',
      images: [
      ],
      options: [
      ],
      variants: [
      ]
    }
  ]
};

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

  pretender.get(apiUrl('/product_publications.json'), function () {
    return [200, {}, JSON.stringify(productsFixture)];
  });

  shopClient.fetchAll('products').then(products => {
    assert.ok(Array.isArray(products), 'products is an array');
    assert.equal(products.length, 1, 'there is one product in the array');
    assert.deepEqual(products[0].attrs, productsFixture.product_publications[0]);
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

  pretender.get(apiUrl('/product_publications.json'), function (request) {
    assert.equal(request.queryParams.product_ids, id.toString(), 'product id sent to server');

    return [200, {}, JSON.stringify(productsFixture)];
  });

  shopClient.fetch('products', id).then(product => {
    assert.notOk(Array.isArray(product), 'products is not an array');
    assert.deepEqual(product.attrs, productsFixture.product_publications[0]);
    assert.equal(product.shopClient, shopClient, 'product knows its owner (the shop client)');
    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});

test('it resolves with a collection of products on ShopClient#fetchQuery', function (assert) {
  assert.expect(5);

  const done = assert.async();

  const id = 1;

  pretender.get(apiUrl('/product_publications.json'), function (request) {
    assert.equal(request.queryParams.collection_id, id.toString(), 'product id sent to server');

    return [200, {}, JSON.stringify(productsFixture)];
  });

  shopClient.fetchQuery('products', { collection_id: id }).then(products => {
    assert.ok(Array.isArray(products), 'products is an array');
    assert.equal(products.length, 1, 'there is one product in the array');
    assert.deepEqual(products[0].attrs, productsFixture.product_publications[0]);
    assert.equal(products[0].shopClient, shopClient, 'product knows its owner (the shop client)');
    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});
