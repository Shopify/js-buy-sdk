import { module, test } from 'qunit';

import join from 'shopify-buy/graph-helpers/join';

module('Unit | GraphHelpers | join');

test('it joins fields with a single comma followed by a space', function (assert) {
  assert.expect(1);

  assert.equal(join('query1', 'query2'), 'query1, query2');
});
