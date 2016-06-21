import { module, test } from 'qunit';
import Store from 'shopify-buy/store';

let store;

const { getItem, setItem, removeItem } = localStorage;

module('Unit | Store', {
  setup() {
    store = new Store();
  },
  teardown() {
    store = null;
    localStorage.getItem = getItem;
    localStorage.setItem = setItem;
    localStorage.removeItem = removeItem;
  }
});

test('it calls localStorage.getItem if localStorage is present on #getItem', function (assert) {
  store.localStorageAvailable = true;
  const id = 'abc123';
  const type = 'carts';
  const key = `${type}.${id}`;
  const cartJson = { cart: { id } };

  localStorage.getItem = function () {
    return JSON.stringify(cartJson);
  };

  const item = store.getItem(key);

  assert.deepEqual(item, cartJson, 'resolves with json');
});

test('it retrieves item from cache if localStorage is not present on #getItem', function (assert) {
  store.localStorageAvailable = false;
  const id = 'abc123';
  const type = 'carts';
  const key = `${type}.${id}`;
  const cartJson = { cart: { id } };

  store.cache[key] = cartJson;

  const item = store.getItem(key);

  assert.deepEqual(item, cartJson, 'resolves with json');
});

test('it calls localStorage.setItem if localStorage is present on #setItem', function (assert) {
  store.localStorageAvailable = true;
  const id = 'abc123';
  const type = 'carts';
  const key = `${type}.${id}`;
  const cartJson = { cart: { id } };

  localStorage.setItem = function (_, value) {
    assert.equal(value, JSON.stringify(cartJson));
  };

  const item = store.setItem(key, cartJson);

  assert.deepEqual(item, cartJson, 'resolves with json');
});

test('it calls sets key in cache if localStorage is not present on #setItem', function (assert) {
  store.localStorageAvailable = false;
  const id = 'abc123';
  const type = 'carts';
  const key = `${type}.${id}`;
  const cartJson = { cart: { id } };

  const item = store.setItem(key, cartJson);

  assert.deepEqual(store.cache[key], cartJson);
  assert.deepEqual(item, cartJson, 'resolves with json');
});
