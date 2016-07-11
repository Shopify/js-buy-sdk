import { module, test } from 'qunit';
import ListingsAdapter from 'shopify-buy/adapters/listings-adapter';
import version from 'shopify-buy/version';
import Promise from 'promise';
import 'shopify-buy/isomorphic-btoa';

let adapter;

const appId = 6;
const domain = 'buckets-o-stuff.myshopify.com';
const baseUrl = `https://${domain}/api/apps/${appId}`;
const apiKey = 'abc123def456ghi';
const base64ApiKey = btoa(apiKey);

function resolvingPromise() {
  return new Promise(function (resolve) {
    resolve({});
  });
}

module('Unit | ListingsAdapter', {
  setup() {
    adapter = new ListingsAdapter();
  },
  teardown() {
    adapter = null;
  }
});

test('it builds an appropriate baseUrl based on configured values', function (assert) {
  assert.expect(1);

  adapter.config = { domain, appId };

  assert.equal(adapter.baseUrl, baseUrl);
});

test('it builds auth headers using the base64 encoded api key', function (assert) {
  assert.expect(1);

  adapter.config = { apiKey };

  assert.deepEqual(adapter.headers, {
    Authorization: `Basic ${base64ApiKey}`,
    'Content-Type': 'application/json',
    'X-SDK-Variant': 'javascript',
    'X-SDK-Version': version
  });
});

test('it builds the url for all collections', function (assert) {
  assert.expect(1);

  adapter.config = { domain, appId };

  assert.equal(adapter.buildUrl('multiple', 'collections'), `${baseUrl}/collection_listings`);
});

test('it builds the url for a single product', function (assert) {
  assert.expect(1);

  const id = 123;

  adapter.config = { domain, appId };

  assert.equal(adapter.buildUrl('single', 'products', id), `${baseUrl}/product_listings/${id}`);
});

test('it builds the url for a query', function (assert) {
  assert.expect(1);

  const id = 134;
  const page = 88;

  adapter.config = { domain, appId };

  const expectedUrl = `${baseUrl}/product_listings?collection_id=${id}&page=${page}`;

  assert.equal(adapter.buildUrl('multiple', 'products', { collection_id: id, page }), expectedUrl);
});

test('it sends a GET, the correct url, and auth headers for fetchMultiple to #ajax', function (assert) {
  assert.expect(3);

  adapter.config = { domain, appId, apiKey };

  adapter.ajax = function (method, url, opts) {
    assert.equal(method, 'GET');
    assert.equal(url, `${baseUrl}/collection_listings`);
    assert.deepEqual(opts.headers, {
      Authorization: `Basic ${base64ApiKey}`,
      'Content-Type': 'application/json',
      'X-SDK-Variant': 'javascript',
      'X-SDK-Version': version
    });

    return resolvingPromise();
  };

  adapter.fetchMultiple('collections');
});

test('it sends a GET, the correct url, and auth headers for fetchSingle to #ajax', function (assert) {
  assert.expect(3);

  const id = 123;

  adapter.config = { domain, appId, apiKey };

  adapter.ajax = function (method, url, opts) {
    assert.equal(method, 'GET');
    assert.equal(url, `${baseUrl}/collection_listings/${id}`);
    assert.deepEqual(opts.headers, {
      Authorization: `Basic ${base64ApiKey}`,
      'Content-Type': 'application/json',
      'X-SDK-Variant': 'javascript',
      'X-SDK-Version': version
    });

    return resolvingPromise();
  };

  adapter.fetchSingle('collections', id);
});

test('it sends a GET, the correct url, and auth headers for fetchMultiple with query to #ajax', function (assert) {
  assert.expect(3);

  const ids = [123, 456, 789];
  const page = 88;

  adapter.config = { domain, appId, apiKey };

  adapter.ajax = function (method, url, opts) {
    // Should resolve with a promise
    assert.equal(method, 'GET');
    assert.equal(url, `${baseUrl}/collection_listings?collection_ids=${encodeURIComponent(ids.join(','))}&page=${page}`);
    assert.deepEqual(opts.headers, {
      Authorization: `Basic ${base64ApiKey}`,
      'Content-Type': 'application/json',
      'X-SDK-Variant': 'javascript',
      'X-SDK-Version': version
    });

    return resolvingPromise();
  };

  adapter.fetchMultiple('collections', { collection_ids: ids, page });
});
