/* eslint no-new: 0 */

import { module, test } from 'qunit';
import Config from 'shopify-buy/config';
import logger from 'shopify-buy/logger';

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

test('it should convert myShopifyDomain to domain', function (assert) {
  assert.expect(1);

  const config = new Config({
    myShopifyDomain: 'krundle',
    apiKey: 123,
    appId: 6
  });

  assert.equal(config.domain, 'krundle.myshopify.com', 'domain should be myshopify.com domain');
});

test('it should output a deprecation warning when using myShopifyDomain', function (assert) {
  assert.expect(3);

  const oldLog = logger.warn;
  let output = [];

  logger.warn = function () {
    output = [...arguments];
  };

  new Config({
    myShopifyDomain: 'krundle',
    apiKey: 123,
    appId: 6
  });

  assert.equal(output.length, 2, 'logging should have a tag for config');
  assert.equal(output[0], 'Config - ', 'the deprecation warning should say it\'s from config');
  assert.notEqual(output[1].indexOf('deprecated'), -1, 'the deprecation warning should describe the problem');
  logger.warn = oldLog;
});

test('it should set domain', function (assert) {
  assert.expect(1);

  const config = new Config({
    domain: 'krundle.com',
    apiKey: 123,
    appId: 6
  });

  assert.equal(config.domain, 'krundle.com', 'domain should be krundle.com domain');
});
