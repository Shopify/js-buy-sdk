/* eslint no-new: 0, no-console: 0,  */
import { module, test } from 'qunit';
import logger from 'shopify-buy/logger';
import { wrapConsole } from 'shopify-buy/logger';

const testOutput = 'test output';
let oldLog;

module('Unit | Logger', {
  before() {
    oldLog = console.log;
  },
  after() {
    console.log = oldLog;
  }
});

test('it should wrap a valid console method', function (assert) {
  assert.expect(2);
  console.log = function () {
    assert.equal(arguments[0], '[JS-BUY-SDK]: ', 'console.log should be tagged');
    assert.equal(arguments[1], testOutput, 'console.log should be wrapped');
  };
  wrapConsole('log')(testOutput);
});

test('it should fallback to console.log if the method is not defined', function (assert) {
  assert.expect(2);
  console.log = function () {
    assert.equal(arguments[0], '[JS-BUY-SDK]: ', 'console.log should be tagged');
    assert.equal(arguments[1], testOutput, 'console.log should be wrapped');
  };
  wrapConsole('output')(testOutput);
});

['debug', 'info', 'warn', 'error'].forEach(method => {
  test(`it should wrap ${method}`, function (assert) {
    assert.expect(1);
    logger[method](testOutput);
    assert.ok(true, `${method} should not throw an error`);
  });
});
