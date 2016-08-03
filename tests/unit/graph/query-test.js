import { module, test } from 'qunit';
import q from 'shopify-buy/graph-helpers/query';

module('Unit | GraphHelpers | query');

test('it yields the child schema off of the query root', function (assert) {
  assert.expect(1);

  q('shop', shop => {
    assert.equal(shop.name, 'Shop');
  });
});

test('it wraps the query in the actual query root string', function (assert) {
  assert.expect(1);

  const query = q('shop', () => {
    return 'someField';
  });

  assert.equal(query, 'query { shop { someField } }');
});
