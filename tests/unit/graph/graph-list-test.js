import { module, test } from 'qunit';
import GraphList from 'shopify-buy/graph-helpers/graph-list';

module('Unit | GraphHelpers | GraphList');

test('it constructs itself as an array', function (assert) {
  const elements = ['a', 'b', 'c'];

  assert.expect(elements.length);

  const model = new GraphList(elements);

  elements.forEach((element, index) => {
    assert.equal(model[index], element);
  });
});

test('it stores passed pagination info', function (assert) {
  assert.expect(2);

  const model = new GraphList([], { hasNextPage: true, hasPreviousPage: true });

  assert.equal(model.hasNextPage, true);
  assert.equal(model.hasPreviousPage, true);
});

test('it defaults pagination info to be at the start and end of the set', function (assert) {
  assert.expect(2);

  const model = new GraphList([]);

  assert.equal(model.hasNextPage, false);
  assert.equal(model.hasPreviousPage, false);
});
