/* eslint no-new: 0 */

import { module, test } from 'qunit';
import Config from 'shopify-buy/config';

module('Unit | Config');

test('it throws an error on no params', function (assert) {
  assert.expect(1);

  assert.throws(function () {
    new Config({});
  }, 'no params should produce an error');
});

test('it throws an error with some but not all params', function (assert) {
  assert.expect(1);

  assert.throws(function () {
    new Config({ apiKey: 123 });
  }, 'some but not all required params should produce an error');
});

test('it doesn\'t throw when all required params are specified', function (assert) {
  assert.expect(1);

  const config = new Config({
    myShopifyDomain: 'krundle',
    apiKey: 123,
    appId: 6
  });

  assert.ok(config);
});
