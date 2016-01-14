import { module, test } from 'qunit';
import ProductAdapter from 'buy-button-sdk/adapters/product-adapter';
import { Promise } from 'rsvp';

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

module('Unit | ProductAdapter', {
  setup() {
    adapter = new ProductAdapter();
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
    Authorization: `Basic ${base64ApiKey}`
  });
});

test('it builds the url for all products', function (assert) {
  assert.expect(1);

  adapter.config = {
    myShopifyDomain, channelId
  };

  assert.equal(adapter.buildUrl('collection'), `${baseUrl}/product_publications.json`);
});

test('it builds the url for a single product', function (assert) {
  assert.expect(1);

  const id = 123;

  adapter.config = { myShopifyDomain, channelId };

  assert.equal(adapter.buildUrl('single', id), `${baseUrl}/product_publications.json?product_ids=${id}`);
});

test('it builds the url for a query', function (assert) {
  assert.expect(1);

  const ids = [123, 456, 789];
  const page = 88;

  adapter.config = { myShopifyDomain, channelId };

  const expectedUrl = `${baseUrl}/product_publications.json?product_ids=${encodeURIComponent(ids.join(','))}&page=${page}`;

  assert.equal(adapter.buildUrl('collection', { product_ids: ids, page }), expectedUrl);
});

test('it sends a GET, the correct url, and auth headers for fetchCollection to #ajax', function (assert) {
  assert.expect(3);

  adapter.config = {
    myShopifyDomain, channelId, apiKey
  };

  adapter.ajax = function (method, url, opts) {
    assert.equal(method, 'get');
    assert.equal(url, `${baseUrl}/product_publications.json`);
    assert.deepEqual(opts.headers, { Authorization: `Basic ${base64ApiKey}` });
    return resolvingPromise();
  };

  adapter.fetchCollection();
});

test('it sends a GET, the correct url, and auth headers for fetchSingle to #ajax', function (assert) {
  assert.expect(3);

  const id = 123;

  adapter.config = {
    myShopifyDomain, channelId, apiKey
  };

  adapter.ajax = function (method, url, opts) {
    assert.equal(method, 'get');
    assert.equal(url, `${baseUrl}/product_publications.json?product_ids=${id}`);
    assert.deepEqual(opts.headers, { Authorization: `Basic ${base64ApiKey}` });
    return resolvingPromise();
  };

  adapter.fetchSingle(id);
});

test('it sends a GET, the correct url, and auth headers for fetchCollection with query to #ajax', function (assert) {
  assert.expect(3);

  const ids = [123, 456, 789];
  const page = 88;

  adapter.config = {
    myShopifyDomain, channelId, apiKey
  };

  adapter.ajax = function (method, url, opts) {
    // Should resolve with a promise
    assert.equal(method, 'get');
    assert.equal(url, `${baseUrl}/product_publications.json?product_ids=${encodeURIComponent(ids.join(','))}&page=${page}`);
    assert.deepEqual(opts.headers, { Authorization: `Basic ${base64ApiKey}` });
    return resolvingPromise();
  };

  adapter.fetchCollection({ product_ids: ids, page });
});
