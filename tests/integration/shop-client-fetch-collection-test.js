import { module, test } from 'qunit';
import ShopClient from 'shopify-buy/shop-client';
import Config from 'shopify-buy/config';
import Pretender from 'pretender';
import { singleCollectionFixture, multipleCollectionsFixture } from '../fixtures/collection-fixture';

const configAttrs = {
  domain: 'buckets-o-stuff.myshopify.com',
  apiKey: 1,
  appId: 6
};

const config = new Config(configAttrs);

const baseUrl = `https://${configAttrs.domain}/api/apps/${configAttrs.appId}`;

function apiUrl(path) {
  return `${baseUrl}${path}`;
}

let shopClient;
let pretender;

module('Integration | ShopClient#fetch* for collections', {
  setup() {
    shopClient = new ShopClient(config);
    pretender = new Pretender();
  },
  teardown() {
    shopClient = null;
    pretender.shutdown();
  }
});


test('it resolves with an array of collections on ShopClient#fetchAll', function (assert) {
  assert.expect(4);

  const done = assert.async();

  pretender.get(apiUrl('/collection_listings'), function () {
    return [200, {}, JSON.stringify(multipleCollectionsFixture)];
  });

  shopClient.fetchAllCollections().then(collections => {
    assert.ok(Array.isArray(collections), 'collections is an array');
    assert.equal(collections.length, 2, 'there is one collection in the array');
    assert.deepEqual(collections[0].attrs, multipleCollectionsFixture.collection_listings[0]);
    assert.equal(collections[0].shopClient, shopClient, 'collection knows its owner (the shop client)');
    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});


test('it resolves with a single collection on ShopClient#fetch', function (assert) {
  assert.expect(4);

  const done = assert.async();

  const id = 1;

  pretender.get(apiUrl('/collection_listings/:id'), function (request) {
    assert.equal(request.params.id, id.toString(), 'collection id sent to server');

    return [200, {}, JSON.stringify(singleCollectionFixture)];
  });

  shopClient.fetchCollection(id).then(collection => {
    assert.notOk(Array.isArray(collection), 'collections is not an array');
    assert.deepEqual(collection.attrs, singleCollectionFixture.collection_listing);
    assert.equal(collection.shopClient, shopClient, 'collection knows its owner (the shop client)');
    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});

test('it resolves with a collection of collections on ShopClient#fetchQuery', function (assert) {
  assert.expect(5);

  const done = assert.async();

  const ids = [1, 2];

  pretender.get(apiUrl('/collection_listings'), function (request) {
    assert.equal(request.queryParams.collection_ids, ids.join(','), 'collection id sent to server');

    return [200, {}, JSON.stringify(multipleCollectionsFixture)];
  });

  shopClient.fetchQueryCollections({ collection_ids: ids }).then(collections => {
    assert.ok(Array.isArray(collections), 'collections is an array');
    assert.equal(collections.length, 2, 'there is one collection in the array');
    assert.deepEqual(collections[0].attrs, multipleCollectionsFixture.collection_listings[0]);
    assert.equal(collections[0].shopClient, shopClient, 'collection knows its owner (the shop client)');
    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});
