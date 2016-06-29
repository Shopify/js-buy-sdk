/* eslint no-new: 0 */

import { module, test } from 'qunit';
import logger from 'shopify-buy/logger';

const testOutput = 'test output';

module('Unit | Logger');

['log', 'debug', 'info', 'warn', 'error'].forEach(method => {
  test(`it should wrap ${method}`, function (assert) {
    assert.expect(2);

    /* eslint-disable no-console */
    const oldLog = console[method];

    console[method] = function () {
      assert.equal(arguments[0], '[JS-BUY-SDK]: ', `console.${method} should be tagged`);
      assert.equal(arguments[1], testOutput, `console.${method} should be wrapped`);
    };

    logger[method](testOutput);
    console[method] = oldLog;
    /* eslint-enable no-console */
  });
});

