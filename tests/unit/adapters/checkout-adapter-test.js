import { module, test } from 'qunit';
import CheckoutAdapter from 'buy-button-sdk/adapters/checkout-adapter';
import assign from 'buy-button-sdk/metal/assign';
import Promise from 'promise';

let adapter;

const myShopifyDomain = 'buckets-o-stuff';
const baseUrl = `https://${myShopifyDomain}.myshopify.com/anywhere`;
const apiKey = 'abc123def456ghi';
const base64ApiKey = btoa(apiKey);

function resolvingPromise(data = {}) {
  return new Promise(function (resolve) {
    resolve(data);
  });
}

module('Unit | CheckoutAdapter', {
  setup() {
    adapter = new CheckoutAdapter();
  },
  teardown() {
    adapter = null;
  }
});

test('it builds an appropriate baseUrl based on configured values', function (assert) {
  assert.expect(1);

  adapter.config = { myShopifyDomain };

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

test('it builds the url for all checkouts (used on #create)', function (assert) {
  assert.expect(1);

  adapter.config = { myShopifyDomain };

  assert.equal(adapter.buildUrl('multiple', 'checkouts'), `${baseUrl}/checkouts.json`);
});

test('it builds the url for a single checkout', function (assert) {
  assert.expect(1);

  const token = 'abc123';

  adapter.config = { myShopifyDomain };

  assert.equal(adapter.buildUrl('single', 'checkouts', token), `${baseUrl}/checkouts/${token}.json`);
});

test('it throws if someone attempts to query the checkout endpoint', function (assert) {
  assert.expect(1);

  const token = 'abc123';

  adapter.config = { myShopifyDomain };

  assert.throws(function () {
    adapter.buildUrl('multiple', 'checkouts', { token });
  }, 'querying checkouts should produce an error');
});

test('it sends a GET, the correct url, and auth headers for fetchSingle to #ajax', function (assert) {
  assert.expect(3);

  const token = 'abc123';

  adapter.config = { myShopifyDomain, apiKey };

  adapter.ajax = function (method, url, opts) {
    assert.equal(method, 'GET');
    assert.equal(url, `${baseUrl}/checkouts/${token}.json`);
    assert.deepEqual(opts.headers, {
      Authorization: `Basic ${base64ApiKey}`,
      'Content-Type': 'application/json'
    });

    return resolvingPromise();
  };

  adapter.fetchSingle('checkouts', token);
});

test('it sends a POST, the correct url, and auth headers to #ajax on #create', function (assert) {
  assert.expect(4);

  const done = assert.async();

  const checkoutJson = { token: 'abc123' };

  adapter.config = { myShopifyDomain, apiKey };

  adapter.ajax = function (method, url, opts) {
    assert.equal(method, 'POST');
    assert.equal(url, `${baseUrl}/checkouts.json`);
    assert.deepEqual(opts.headers, {
      Authorization: `Basic ${base64ApiKey}`,
      'Content-Type': 'application/json'
    });

    return resolvingPromise({ json: checkoutJson });
  };

  adapter.create('checkouts').then(result => {
    assert.equal(result, checkoutJson);
    done();
  }).catch(() => {
    assert.ok(false);
    done();
  });
});

test('it sends a PATCH, the correct url, and auth headers to #ajax on #update', function (assert) {
  assert.expect(4);

  const done = assert.async();

  const id = 'abc123';
  const payload = { checkout: { id, line_items: [] } };
  const serverResponse = assign({}, payload);

  adapter.config = { myShopifyDomain, apiKey };

  adapter.ajax = function (method, url, opts) {
    assert.equal(method, 'PATCH');
    assert.equal(url, `${baseUrl}/checkouts/${id}.json`);
    assert.deepEqual(opts.headers, {
      Authorization: `Basic ${base64ApiKey}`,
      'Content-Type': 'application/json'
    });

    return resolvingPromise({ json: serverResponse });
  };

  adapter.update('checkouts', id, payload).then(result => {
    assert.equal(result, serverResponse);
    done();
  }).catch(() => {
    assert.ok(false);
    done();
  });
});
