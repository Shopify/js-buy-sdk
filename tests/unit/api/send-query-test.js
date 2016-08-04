import { module, test } from 'qunit';
// import { step, resetStep } from 'shopify-buy/tests/helpers/assert-step';
import Pretender from 'pretender';
import sendQuery from 'shopify-buy/send-query';

let pretender;

const config = {
  domain: 'krundle.com',
  apiKey: 123
};

const hashedKey = btoa(config.apiKey);

const url = `https://${config.domain}/api/graph`;

module('Unit | sendQuery', {
  setup() {
    pretender = new Pretender();
  },
  teardown() {
    pretender.shutdown();
  }
});

test('it returns a promise', function (assert) {
  assert.expect(3);

  pretender.post(url, function () {
    return [200, {}, ''];
  });

  const result = sendQuery('query { }', config);

  assert.equal(typeof result, 'object');
  assert.equal(typeof result.then, 'function');
  assert.equal(typeof result.catch, 'function');
});

test('it sends auth headers', function (assert) {
  assert.expect(1);

  const done = assert.async();

  pretender.post(url, function (request) {
    assert.equal(request.requestHeaders.authorization, `Basic ${hashedKey}`);

    return [200, {}, ''];
  });

  sendQuery('query { }', config).then(() => {
    done();
  }).catch(() => {
    done();
  });
});

test('it sends the query as a form encoded blob under the `query` key', function (assert) {
  assert.expect(2);

  const done = assert.async();
  const query = 'query { shop { name } }';

  pretender.post(url, function (request) {
    assert.equal(request.requestHeaders['content-type'], 'application/json');

    assert.equal(JSON.parse(request.requestBody).query, query);

    return [200, {}, ''];
  });

  sendQuery(query, config).then(() => {
    done();
  }).catch(() => {
    done();
  });
});
