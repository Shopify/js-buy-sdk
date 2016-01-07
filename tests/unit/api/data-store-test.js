import { module, test } from 'qunit';
import DataStore from 'buy-button-sdk/data-store';

module('Unit | DataStore');

test('it retains the configured settings', function (assert) {
  const store = new DataStore({
    myShopifyDomain: 'buckets-o-stuff',
    apiKey: 123,
    channelId: 'abc'
  });

  assert.equal(store.myShopifyDomain, 'buckets-o-stuff');
  assert.equal(store.apiKey, 123);
  assert.equal(store.channelId, 'abc');
});

test('it computes the base64 api key from the apiKey', function (assert) {
  let apiKey = 123;

  const store = new DataStore({ apiKey });

  assert.equal(store.base64ApiKey, btoa(apiKey), 'computes based on apiKey from constructor');

  store.apiKey = apiKey = 456;

  assert.equal(store.base64ApiKey, btoa(apiKey), 'computes after apiKey mutation');
});

test('it doesn\'t allow writing to the base64 computed key', function (assert) {
  const store = new DataStore({});

  assert.throws(function () {
    store.base64ApiKey = 'beans';
  }, 'base64ApiKey shouldn\'t be writable');
});
