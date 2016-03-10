import { module, test } from 'qunit';
import CoreObject from 'js-buy-sdk/metal/core-object';


module('Unit | CoreObject', {
});

test('it\'s an empty class that returns instances of itself', function (assert) {
  const c = new CoreObject();

  assert.ok(c instanceof CoreObject);
  assert.ok(CoreObject.prototype.isPrototypeOf(c));
});

test('it inherits from Object', function (assert) {
  const c = new CoreObject();

  assert.ok(Object.prototype.isPrototypeOf(c));
});

test('it can be extended', function (assert) {
  const ChildClass = CoreObject.extend({
    constructor() {
      this.theThing = 'its a thing';
    }
  });

  const c = new ChildClass();

  assert.ok(ChildClass.prototype.isPrototypeOf(c), 'its a child class');
  assert.ok(CoreObject.prototype.isPrototypeOf(c), 'its also a CoreObject');
  assert.ok(Object.prototype.isPrototypeOf(c), 'its also an Object');
});
