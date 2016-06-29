/* eslint no-new: 0 */

import { module, test } from 'qunit';
import Config from 'shopify-buy/config';

module('Unit | Config');

const DeprecationKlass = Config.extend({
  constructor() {
    this.super(...arguments);
  },
  deprecatedProperties: {
    dprop1: 'transformProp1',
    dprop2: 'transformProp2',
    dprop3: 'transformProp3'
  },
  requiredProperties: [
    'endProp1',
    'endProp2',
    'endProp3',
    'endProp4',
    'endProp5'
  ],
  transformProp1(value, attrs) {
    const initial = value.split(':');

    attrs.endProp1 = initial[0];
    attrs.endProp4 = initial[1];
  },
  transformProp2(value, attrs) {
    attrs.endProp2 = 'z';
  },
  transformProp3(value, attrs) {
    attrs.endProp3 += attrs.dprop3;
  },
  endProp1: '',
  endProp2: '',
  endProp3: '',
  endProp4: '',
  endProp5: ''
});

test('it should not touch non deprecated properties', function (assert) {
  assert.expect(5);

  const dklass = new DeprecationKlass({
    endProp1: 'a',
    endProp2: 'b',
    endProp3: 'c',
    endProp4: 'd',
    endProp5: 'e'
  });

  assert.equal(dklass.endProp1, 'a', 'property should equal the value passed');
  assert.equal(dklass.endProp2, 'b', 'property should equal the value passed');
  assert.equal(dklass.endProp3, 'c', 'property should equal the value passed');
  assert.equal(dklass.endProp4, 'd', 'property should equal the value passed');
  assert.equal(dklass.endProp5, 'e', 'property should equal the value passed');
});

test('it should allow multiple deprecation transformations', function (assert) {
  assert.expect(5);

  const dklass = new DeprecationKlass({
    dprop1: 'test:one',
    dprop2: 'you wont see this',
    dprop3: 'at',
    endProp3: 'c',
    endProp5: 'e'
  });

  assert.equal(dklass.endProp1, 'test', 'property should equal the transformed value');
  assert.equal(dklass.endProp2, 'z', 'property should equal the transformed value');
  assert.equal(dklass.endProp3, 'cat', 'property should equal the transformed value');
  assert.equal(dklass.endProp4, 'one', 'property should equal the transformed value');
  assert.equal(dklass.endProp5, 'e', 'property should equal the value passed');
});

test('it throws an error with some but not all params defined even with transformations', function (assert) {
  assert.expect(1);

  assert.throws(function () {
    new DeprecationKlass({
      dprop1: 'test:one',
      dprop2: 'you wont see this',
      dprop3: 'at',
      endProp3: 'c'
    });
  }, 'some but not all required params should produce an error');
});
