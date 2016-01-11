import { module, test } from 'qunit';
import { step, resetStep } from 'buy-button-sdk/tests/helpers/assert-step';
import ajax from 'buy-button-sdk/ajax';
import Pretender from 'pretender';
import { Response } from 'fetch';


let pretender;
const path = '/some-path';


module('Unit | Ajax', {
  setup() {
    pretender = new Pretender();
  },
  teardown() {
    pretender.shutdown();
    resetStep();
  }
});


test('it returns a promise', function (assert) {
  assert.expect(4);

  pretender.get(path, function () {
    // NO-OP
    return [200, {}, ''];
  });

  const result = ajax('get', path);

  assert.equal(typeof result, 'object');
  assert.equal(typeof result.then, 'function');
  assert.equal(typeof result.catch, 'function');
  assert.equal(typeof result.finally, 'function');
});

test('it respects request types', function (assert) {
  assert.expect(2);

  pretender.get(path, function () {
    step(1, 'ajax does an http get', assert);

    return [200, {}, ''];
  });

  pretender.post(path, function () {
    step(2, 'ajax does an http post', assert);

    return [200, {}, ''];
  });

  ajax('get', path);
  ajax('post', path);
});

test('it sends headers', function (assert) {
  assert.expect(1);

  const headers = {
    'x-my-header': 'header value'
  };

  pretender.get(path, function (request) {
    assert.deepEqual(request.requestHeaders, headers);

    return [200, {}, ''];
  });

  ajax('get', path, { headers });
});

test('it sends a message body if specified', function (assert) {
  assert.expect(1);

  const bodyData = {
    'some-param': 'some-value'
  };
  const body = JSON.stringify(bodyData);


  pretender.post(path, function (request) {
    assert.deepEqual(JSON.parse(request.requestBody), bodyData);

    return [200, {}, ''];
  });

  ajax('post', path, { body });
});

test('it resolves json if json is present', function (assert) {
  assert.expect(3);
  const done = assert.async();

  const data = { 'my-json-data': 'way-cool' };

  pretender.get(path, function () {
    return [200, {}, JSON.stringify(data)];
  });

  ajax('get', path).then(result => {
    assert.deepEqual(result.json, data);
    assert.ok(result.isJSON, 'JSON type indicator');
    assert.notOk(result.isText, 'falsy text type indicator');
    done();
  }).catch(error => {
    window.console.error(error);
    assert.ok(false, 'promise should not reject');
    done();
  });
});

test('it resolves with text if the result is not json', function (assert) {
  assert.expect(3);
  const done = assert.async();

  const data = 'This is not JSON';

  pretender.get(path, function () {
    return [200, {}, data];
  });

  ajax('get', path).then(result => {
    assert.equal(result.text, data);
    assert.ok(result.isText, 'text type indicator');
    assert.notOk(result.isJSON, 'falsy JSON type indicator');
    done();
  }).catch(error => {
    window.console.error(error);
    assert.ok(false, 'promise should not reject');
    done();
  });
});

test('it raises on error statuses', function (assert) {
  assert.expect(2);
  const done = assert.async();

  pretender.get(path, function () {
    return [401, {}, 'Unauthorized'];
  });

  ajax('get', path).then(() => {
    assert.ok(false, window.console.error('promise should NOT resolve'));
    done();
  }).catch(error => {
    assert.equal(error.status, 401);
    assert.equal(error.message, 'Unauthorized');
    done();
  });
});

test('it forwards the original response', function (assert) {
  assert.expect(1);
  const done = assert.async();

  pretender.get(path, function () {
    return [200, {}, ''];
  });

  ajax('get', path).then(result => {
    assert.ok(result.response instanceof Response);
    done();
  }).catch(error => {
    window.console.error(error);
    assert.ok(false, 'promise should not reject');
    done();
  });

});
