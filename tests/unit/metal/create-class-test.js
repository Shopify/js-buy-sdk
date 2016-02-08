import { module, test } from 'qunit';
import { step, resetStep } from 'buy-button-sdk/tests/helpers/assert-step';
import createClass from 'buy-button-sdk/metal/create-class';


module('Unit | createClass', {
  setup() {
    resetStep();
  }
});

function FakeConstructor() {}

test('it returns the class wrapped constructor', function (assert) {
  const classProps = {
    constructor: FakeConstructor
  };


  const Klass = createClass(classProps);

  assert.equal(Klass.wrappedFunction, FakeConstructor);
});

test('it can create instances of the constructor', function (assert) {
  const Klass = createClass({
    constructor: FakeConstructor
  });

  const k = new Klass();

  assert.ok(k instanceof Klass);
  assert.equal(k.constructor.wrappedFunction, FakeConstructor);
});

test('it attaches static attributes to the constructor', function (assert) {
  const staticAttr = 'some-static-attr';

  const Klass = createClass({
    constructor: FakeConstructor,

    static: {
      someStaticAttr: staticAttr
    }
  });

  assert.equal(Klass.someStaticAttr, staticAttr);
});

test('it attaches instance properties to the prototype/instance', function (assert) {
  const value = 'abc123';

  const classProps = {
    constructor: FakeConstructor,
    get someGettableAttr() {
      return value;
    }
  };

  const Klass = createClass(classProps);

  const k = new Klass();

  assert.equal(k.someGettableAttr, value);
});

test('it attaches static methods to the constructor', function (assert) {

  const classProps = {
    constructor: FakeConstructor,

    static: {
      doTheThing() {
        assert.ok(true, 'doing the thing');
      }
    }
  };

  const Klass = createClass(classProps);

  Klass.doTheThing();
});

test('it attaches instance methods to the prototype/instance', function (assert) {

  const classProps = {
    constructor: FakeConstructor,

    doTheThing() {
      assert.ok(true, 'doing the thing');
    }
  };

  const Klass = createClass(classProps);

  const k = new Klass();

  k.doTheThing();
});

test('it inherits props and methods from the parent', function (assert) {
  assert.expect(6);

  const Parent = createClass({
    constructor: function () {
      step(2, 'it calls the parent constructor', assert);
    },

    get invertedProp() {
      step(4, 'it calls the parents getter', assert);
      return this.shadowingInvertedProp;
    },
    set invertedProp(value) {
      step(3, 'it calls the parents setter', assert);
      this.shadowingSomeProp = !value;
      return this.shadowingInvertedProp;
    },

    sideEffects() {
      step(5, 'it calls the parents methods', assert);
    }
  });

  const Child = createClass({
    constructor: function () {
      step(1, 'it calls the child constructor', assert);
      Parent.call(this);
    }
  }, Parent);

  const child = new Child();

  child.invertedProp = true;
  assert.notOk(child.invertedProp);

  child.sideEffects();
});

test('it can call the parent constructor with this.super()', function (assert) {
  assert.expect(1);

  const Parent = createClass({
    constructor: function () {
      assert.ok(true, 'it calls the parent');
    }
  });

  const Child = createClass({
    constructor: function () {
      this.super();
    }
  }, Parent);

  return new Child();
});

test('it can call parent methods with this.super()', function (assert) {
  assert.expect(1);

  const Parent = createClass({
    constructor: function () {
    },
    sideEffects() {
      assert.ok(true, 'it calls the parent');
    }
  });

  const Child = createClass({
    constructor: function () {
    },

    sideEffects() {
      this.super();
    }
  }, Parent);

  const c = new Child();

  c.sideEffects();
});

test('it doesn\'t define super if there is no parent method', function (assert) {
  assert.expect(1);

  const Parent = createClass({
    constructor: function () {
    }
  });

  const Child = createClass({
    constructor: function () {
    },
    sideEffects() {
      assert.equal(typeof this.super, 'undefined');
    }
  }, Parent);

  const c = new Child();

  c.sideEffects();
});

test('it calls parent methods in the context of the child, not the prototype', function (assert) {
  assert.expect(1);

  const Parent = createClass({
    constructor: function () {
    },
    checkContext(context) {
      assert.equal(this, context);
    }
  });

  const Child = createClass({
    constructor: function () {
    },
    checkContext(context) {
      this.super(context);
    }
  }, Parent);

  const c = new Child();

  c.checkContext(c);
});
