import { module, test } from 'qunit';
import LocalStorageAdapter from 'shopify-buy/adapters/local-storage-adapter';

let adapter;

const { getItem, setItem, removeItem } = localStorage;

module('Unit | LocalStorageAdapter', {
  setup() {
    adapter = new LocalStorageAdapter();
  },
  teardown() {
    adapter = null;
    localStorage.getItem = getItem;
    localStorage.setItem = setItem;
    localStorage.removeItem = removeItem;
  }
});

test('it calls `getItem` on store with the framework name, type, and id on #fetchSingle', function (assert) {
  assert.expect(2);

  const done = assert.async();

  const id = 'abc123';
  const type = 'carts';

  const cartJson = { cart: { id } };

  adapter.store.getItem = function (key) {
    assert.equal(key, `${type}.${id}`, 'uses correct key');

    return cartJson;
  };

  adapter.fetchSingle(type, id).then(result => {
    assert.deepEqual(result, cartJson, 'resolves with json');
    done();
  }).catch(() => {
    assert.ok(false);
    done();
  });
});

test('it calls `setItem` on localStorage with the proper key name, and json payload on #create', function (assert) {
  assert.expect(2);

  const done = assert.async();

  const type = 'carts';

  const cartAttrs = {};
  const cartJson = { cart: cartAttrs };

  adapter.store.setItem = function (key) {
    assert.ok(key.match(/carts\.shopify-buy\.\d+.\d+/), 'creates an id');
  };

  adapter.create(type, cartJson).then(result => {
    assert.deepEqual(result, cartJson);
    done();
  }).catch(() => {
    assert.ok(false);
    done();
  });
});

test('it calls setItem on #update', function (assert) {
  assert.expect(2);

  const done = assert.async();

  const id = 'abc123';
  const type = 'carts';

  const cartJson = { cart: { id } };

  adapter.store.setItem = function (key) {
    assert.equal(key, `${type}.${cartJson.cart.id}`);
  };

  adapter.update(type, id, cartJson).then(result => {
    assert.equal(result, cartJson);
    done();
  }).catch(() => {
    assert.ok(false);
    done();
  });
});
