import { module, test } from 'qunit';
import PublicationAdapter from 'buy-button-sdk/adapters/publication-adapter';
import Promise from 'promise';

let adapter;

const channelId = 'abc123';
const myShopifyDomain = 'buckets-o-stuff';
const baseUrl = `https://${myShopifyDomain}.myshopify.com/api/channels/${channelId}`;
const apiKey = 'abc123def456ghi';
const base64ApiKey = btoa(apiKey);

function resolvingPromise() {
  return new Promise(function (resolve) {
    resolve({});
  });
}

module('Unit | PublicationAdapter', {
  setup() {
    adapter = new PublicationAdapter();
  },
  teardown() {
    adapter = null;
  }
});

test('it builds an appropriate baseUrl based on configured values', function (assert) {
  assert.expect(1);

  adapter.config = { myShopifyDomain, channelId };

  assert.equal(adapter.baseUrl, baseUrl);
});

test('it builds auth headers using the base64 encoded api key', function (assert) {
  assert.expect(1);

  adapter.config = { apiKey };

  assert.deepEqual(adapter.headers, {
    Authorization: `Basic ${base64ApiKey}`,
    'Content-Type': 'application/json'
  });
});

test('it builds the url for all collections', function (assert) {
  assert.expect(1);

  adapter.config = {
    myShopifyDomain, channelId
  };

  assert.equal(adapter.buildUrl('multiple', 'collections'), `${baseUrl}/collection_publications.json`);
});

test('it builds the url for a single collection', function (assert) {
  assert.expect(1);

  const id = 123;

  adapter.config = { myShopifyDomain, channelId };

  assert.equal(adapter.buildUrl('single', 'products', id), `${baseUrl}/product_publications.json?product_ids=${id}`);
});

test('it builds the url for a query', function (assert) {
  assert.expect(1);

  const id = 134;
  const page = 88;

  adapter.config = { myShopifyDomain, channelId };

  const expectedUrl = `${baseUrl}/product_publications.json?collection_id=${id}&page=${page}`;

  assert.equal(adapter.buildUrl('multiple', 'products', { collection_id: id, page }), expectedUrl);
});

test('it sends a GET, the correct url, and auth headers for fetchMultiple to #ajax', function (assert) {
  assert.expect(3);

  adapter.config = {
    myShopifyDomain, channelId, apiKey
  };

  adapter.ajax = function (method, url, opts) {
    assert.equal(method, 'GET');
    assert.equal(url, `${baseUrl}/collection_publications.json`);
    assert.deepEqual(opts.headers, {
      Authorization: `Basic ${base64ApiKey}`,
      'Content-Type': 'application/json'
    });
    return resolvingPromise();
  };

  adapter.fetchMultiple('collections');
});

test('it sends a GET, the correct url, and auth headers for fetchSingle to #ajax', function (assert) {
  assert.expect(3);

  const id = 123;

  adapter.config = {
    myShopifyDomain, channelId, apiKey
  };

  adapter.ajax = function (method, url, opts) {
    assert.equal(method, 'GET');
    assert.equal(url, `${baseUrl}/collection_publications.json?collection_ids=${id}`);
    assert.deepEqual(opts.headers, {
      Authorization: `Basic ${base64ApiKey}`,
      'Content-Type': 'application/json'
    });
    return resolvingPromise();
  };

  adapter.fetchSingle('collections', id);
});

test('it sends a GET, the correct url, and auth headers for fetchMultiple with query to #ajax', function (assert) {
  assert.expect(3);

  const ids = [123, 456, 789];
  const page = 88;

  adapter.config = {
    myShopifyDomain, channelId, apiKey
  };

  adapter.ajax = function (method, url, opts) {
    // Should resolve with a promise
    assert.equal(method, 'GET');
    assert.equal(url, `${baseUrl}/collection_publications.json?collection_ids=${encodeURIComponent(ids.join(','))}&page=${page}`);
    assert.deepEqual(opts.headers, {
      Authorization: `Basic ${base64ApiKey}`,
      'Content-Type': 'application/json'
    });
    return resolvingPromise();
  };

  adapter.fetchMultiple('collections', { collection_ids: ids, page });
});
