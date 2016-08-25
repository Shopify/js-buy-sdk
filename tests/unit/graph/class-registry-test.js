import { module, test } from 'qunit';

import ClassRegistry from 'shopify-buy/graph-helpers/class-registry';
import GraphModel from 'shopify-buy/graph-helpers/graph-model';

module('Unit | GraphHelpers | ClassRegistry');

test('it returns the defined constructor fot the type', function (assert) {
  assert.expect(1);

  const registry = new ClassRegistry();

  function MyClass() {}

  registry.registerClassForType(MyClass, 'SomeType');

  assert.equal(registry.classForType('SomeType'), MyClass);
});

test('it falls back to the GraphModel type when no types are available', function (assert) {
  assert.expect(1);

  const registry = new ClassRegistry();

  assert.equal(registry.classForType('SomeType'), GraphModel);
});

test('it can unregister a class for a type', function (assert) {
  assert.expect(2);

  const registry = new ClassRegistry();

  function MyClass() {}

  registry.registerClassForType(MyClass, 'SomeType');

  assert.equal(registry.classForType('SomeType'), MyClass);

  registry.unregisterClassForType('SomeType');

  assert.equal(registry.classForType('SomeType'), GraphModel);
});
