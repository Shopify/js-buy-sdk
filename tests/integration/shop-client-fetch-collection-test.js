
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

const collectionsFixture = {
  collection_publications: [
    {
      id: 220591297,
      collection_id: 159064961,
      channel_id: 40889985,
      created_at: '2016-01-05T11:32:26-05:00',
      updated_at: '2016-01-05T11:32:26-05:00',
      body_html: '',
      handle: 'blergh',
      image: null,
      title: 'Blergh.',
      published_at: '2016-01-05T11:32:26-05:00',
      published: true
    }
  ]
};

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

  pretender.get(apiUrl('/collection_publications.json'), function () {
    return [200, {}, JSON.stringify(collectionsFixture)];
  });

  shopClient.fetchAll('collections').then(collections => {
    assert.ok(Array.isArray(collections), 'collections is an array');
    assert.equal(collections.length, 1, 'there is one collection in the array');
    assert.deepEqual(collections[0].attrs, collectionsFixture.collection_publications[0]);
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

  pretender.get(apiUrl('/collection_publications.json'), function (request) {
    assert.equal(request.queryParams.collection_ids, id.toString(), 'collection id sent to server');

    return [200, {}, JSON.stringify(collectionsFixture)];
  });

  shopClient.fetch('collections', id).then(collection => {
    assert.notOk(Array.isArray(collection), 'collections is not an array');
    assert.deepEqual(collection.attrs, collectionsFixture.collection_publications[0]);
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

  const id = 1;

  pretender.get(apiUrl('/collection_publications.json'), function (request) {
    assert.equal(request.queryParams.collection_id, id.toString(), 'collection id sent to server');

    return [200, {}, JSON.stringify(collectionsFixture)];
  });

  shopClient.fetchQuery('collections', { collection_id: id }).then(collections => {
    assert.ok(Array.isArray(collections), 'collections is an array');
    assert.equal(collections.length, 1, 'there is one collection in the array');
    assert.deepEqual(collections[0].attrs, collectionsFixture.collection_publications[0]);
    assert.equal(collections[0].shopClient, shopClient, 'collection knows its owner (the shop client)');
    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});
