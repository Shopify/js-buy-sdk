import { test, module } from 'qunit';

module('some module');

test('some test', function (assert) {
  assert.expect(1);

  assert.ok(true);
});

test('some failing test', function (assert) {
  assert.expect(1);

  assert.ok(false);
});
