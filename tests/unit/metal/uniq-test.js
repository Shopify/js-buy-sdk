import { module, test } from 'qunit';
import uniq from 'js-buy-sdk/metal/uniq';

module('Unit | uniq');

test('it rejects duplicates.', function (assert) {
  assert.expect(1);

  const emptyObject = {};
  const uniqueEmptyObjectOne = {};
  const uniqueEmptyObjectTwo = {};

  const result = uniq([
    'abc',
    4,
    uniqueEmptyObjectOne,
    emptyObject,
    4,
    'def',
    'abc',
    emptyObject,
    uniqueEmptyObjectTwo
  ]);

  assert.deepEqual(result, [
    'abc',
    4,
    uniqueEmptyObjectOne,
    emptyObject,
    'def',
    uniqueEmptyObjectTwo
  ]);
});
