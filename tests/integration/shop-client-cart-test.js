import { module, test } from 'qunit';
import { step, resetStep } from 'js-buy-sdk/tests/helpers/assert-step';
import ShopClient from 'js-buy-sdk/shop-client';
import Config from 'js-buy-sdk/config';
import { GUID_KEY } from 'js-buy-sdk/metal/guid-for';
import assign from 'js-buy-sdk/metal/assign';

const configAttrs = {
  myShopifyDomain: 'buckets-o-stuff',
  apiKey: 1,
  channelId: 'abc123'
};


const config = new Config(configAttrs);

const cartFixture = {
  cart: {
    subtotal_price: '0.00',
    line_items: []
  }
};

let shopClient;

const id = cartFixture.cart[GUID_KEY] = 'js-buy-sdk.123457890.1';
const { getItem, setItem, removeItem } = localStorage;

module('Integration | ShopClient - carts', {
  setup() {
    shopClient = new ShopClient(config);
    resetStep();
  },
  teardown() {
    shopClient = null;
    localStorage.getItem = getItem;
    localStorage.setItem = setItem;
    localStorage.removeItem = removeItem;
  }
});

test('it resolves with a new cart on ShopClient#create', function (assert) {
  assert.expect(6);

  const done = assert.async();

  const newCart = assign({}, cartFixture.cart);

  delete newCart[GUID_KEY];

  localStorage.setItem = function (key, value) {
    assert.ok(key.match(/js-buy-sdk\.\d+\.\d+/));
    assert.deepEqual(JSON.parse(value).cart.line_items, newCart.line_items);
    assert.equal(JSON.parse(value).cart.subtotal_price, newCart.subtotal_price);
  };

  shopClient.create('carts', newCart).then(cart => {
    const generatedId = cart.attrs[GUID_KEY];

    newCart[GUID_KEY] = '';
    cart.attrs[GUID_KEY] = '';

    assert.ok(generatedId.match(/js-buy-sdk\.\d+\.\d+/));
    assert.deepEqual(cart.attrs, newCart);
    assert.equal(cart.shopClient, shopClient);
    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});

test('it resolves with an existing cart on ShopClient#fetch', function (assert) {
  assert.expect(3);

  const done = assert.async();

  localStorage.getItem = function (key) {
    assert.equal(key, `carts.${id}`);

    return JSON.stringify(cartFixture);
  };

  shopClient.fetch('carts', id).then(cart => {
    assert.deepEqual(cart.attrs, cartFixture.cart);
    assert.equal(cart.shopClient, shopClient);
    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});

test('it resolves with a new modified cart on ShopClient#update', function (assert) {
  assert.expect(7);

  const done = assert.async();

  const lineItem = {
    quantity: 1,
    id: 12345
  };

  localStorage.getItem = function (key) {
    step(1, 'runs a fetch', assert);
    assert.equal(key, `carts.${id}`);

    return JSON.stringify(cartFixture);
  };

  localStorage.setItem = function (key, value) {
    step(3, 'runs an update', assert);

    const payload = JSON.parse(value);

    assert.deepEqual(payload.cart.line_items[0], lineItem);
  };

  shopClient.fetch('carts', id).then(cart => {
    step(2, 'resolves with a model', assert);

    cart.attrs.line_items = [lineItem];

    shopClient.update('carts', cart).then(updatedCart => {
      step(4, 'resolves with the updated line items', assert);
      assert.deepEqual(updatedCart.attrs.line_items[0], lineItem);
      done();
    }).catch(() => {
      assert.ok(false, '#2 promise should not reject');
      done();
    });
  }).catch(() => {
    assert.ok(false, '#1 promise should not reject');
    done();
  });
});
