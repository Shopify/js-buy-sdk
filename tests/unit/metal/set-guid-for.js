import { module, test } from 'qunit';
import setGuidFor from 'shopify-buy/metal/set-guid-for';
import uniq from 'shopify-buy/metal/uniq';

module('Unit | setGuidFor');

test('it generates unique ids', function (assert) {
  assert.expect(1);
  let i;
  const items = [];

  for (i = 0; i < 1000; i++) {
    items.push({});
  }

  const ids = items.map(item => {
    return setGuidFor(item);
  });

  const uniqueIds = uniq(ids);

  assert.deepEqual(uniqueIds, ids, 'all ids should be unique');
});

test('it doesn\'t regenerate ids for duplicates', function (assert) {
  assert.expect(1);
  const dupedObject = {};

  const items = [
    1,
    1,
    1,
    1,
    'duplicate words',
    'duplicate words',
    'duplicate words',
    'duplicate words',
    'duplicate words',
    'duplicate words',
    true,
    true,
    true,
    false,
    false,
    {},
    dupedObject,
    dupedObject
  ];

  const ids = items.map(item => {
    return setGuidFor(item);
  });

  const uniqueIds = uniq(ids);
  const uniqueItems = uniq(items);

  assert.equal(uniqueIds.length, uniqueItems.length, 'the number of unique ids matches the number of unique items');
});
