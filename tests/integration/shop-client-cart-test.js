import { module, test } from 'qunit';
import { step, resetStep } from 'shopify-buy/tests/helpers/assert-step';
import ShopClient from 'shopify-buy/shop-client';
import Config from 'shopify-buy/config';
import GUID_KEY from 'shopify-buy/metal/guid-key';
import assign from 'shopify-buy/metal/assign';

const configAttrs = {
  myShopifyDomain: 'buckets-o-stuff',
  apiKey: 'abc123',
  appId: 6
};


const config = new Config(configAttrs);

const cartFixture = {
  cart: {
    subtotal_price: '0.00',
    line_items: []
  }
};

let shopClient;

const id = cartFixture.cart[GUID_KEY] = 'shopify-buy.123457890.1';
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

  const cartAttrs = assign({}, cartFixture.cart);

  delete cartAttrs[GUID_KEY];

  localStorage.setItem = function (key, value) {
    if (key !== '__storage_test__') {
      assert.ok(key.match(/shopify-buy\.\d+\.\d+/));
      assert.deepEqual(JSON.parse(value).cart.line_items, cartAttrs.line_items);
      assert.equal(JSON.parse(value).cart.subtotal_price, cartAttrs.subtotal_price);
    }
  };

  shopClient.createCart(cartAttrs).then(cart => {
    const generatedId = cart.attrs[GUID_KEY];

    cartAttrs[GUID_KEY] = '';
    cart.attrs[GUID_KEY] = '';

    assert.ok(generatedId.match(/shopify-buy\.\d+\.\d+/));
    assert.deepEqual(cart.attrs, cartAttrs);
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

  shopClient.fetchCart(id).then(cart => {
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
    if (key !== '__storage_test__') {
      step(3, 'runs an update', assert);

      const payload = JSON.parse(value);

      assert.deepEqual(payload.cart.line_items[0], lineItem);
    }
  };

  shopClient.fetchCart(id).then(cart => {
    step(2, 'resolves with a model', assert);

    cart.attrs.line_items = [lineItem];

    shopClient.updateCart(cart).then(updatedCart => {
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

test('it has a checkout url reflecting the line items in the cart', function (assert) {
  assert.expect(1);

  const done = assert.async();

  localStorage.getItem = function () {
    return JSON.stringify(cartFixture);
  };

  const lineItem = {
    quantity: 1,
    variant_id: 12345
  };
  const baseUrl = `https://${config.domain}/cart`;
  const lineItemPath = `${lineItem.variant_id}:${lineItem.quantity}`;
  const query = `api_key=${config.apiKey}&_fd=0`;


  shopClient.fetchCart(id).then(cart => {
    cart.attrs.line_items = [lineItem];

    assert.equal(cart.checkoutUrl, `${baseUrl}/${lineItemPath}?${query}`);

    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});
