import { module, test } from 'qunit';
import ShopClient from 'shopify-buy/shop-client';
import Config from 'shopify-buy/config';
import { GUID_KEY } from 'shopify-buy/metal/set-guid-for';
import CartModel from 'shopify-buy/models/cart-model';

const configAttrs = {
  domain: 'buckets-o-stuff.myshopify.com',
  apiKey: 'abc123',
  appId: 6
};


const config = new Config(configAttrs);

let shopClient;
let fakeLocalStorage;

const { getItem, setItem, removeItem } = localStorage;

module('Integration | ShopClient#fetchRecentCart', {
  setup() {
    shopClient = new ShopClient(config);
    fakeLocalStorage = {};

    localStorage.getItem = function (key) {
      return fakeLocalStorage[key];
    };
    localStorage.setItem = function (key, value) {
      fakeLocalStorage[key] = value;
    };
    localStorage.removeItem = function (key) {
      delete fakeLocalStorage[key];
    };
  },
  teardown() {
    shopClient = null;
    localStorage.getItem = getItem;
    localStorage.setItem = setItem;
    localStorage.removeItem = removeItem;
  }
});


test('it resolves with an exisitng cart when a reference and corresponding cart exist', function (assert) {
  assert.expect(1);

  const done = assert.async();

  const cartReferenceKey = `references.${config.domain}.recent-cart`;
  const cartId = 'carts.shopify-buy.123';

  const cartAttrs = {
    cart: {
      line_items: [{ variantId: 123 }]
    }
  };

  const cartRef = {
    referenceId: cartId.replace('carts.', ''),
    [GUID_KEY]: cartReferenceKey
  };

  fakeLocalStorage[cartReferenceKey] = JSON.stringify(cartRef);
  fakeLocalStorage[cartId] = JSON.stringify(cartAttrs);

  shopClient.fetchRecentCart().then(cart => {
    assert.deepEqual(cart.attrs, cartAttrs.cart);
    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});

test('it resolves with a new cart when a no reference exists, persisting both the cart and reference', function (assert) {
  assert.expect(6);

  const done = assert.async();

  assert.equal(Object.keys(fakeLocalStorage).length, 0);

  shopClient.fetchRecentCart().then(cart => {
    assert.equal(Object.keys(fakeLocalStorage).length, 2);

    assert.ok(cart);
    assert.ok(CartModel.prototype.isPrototypeOf(cart));

    assert.equal(Object.keys(fakeLocalStorage).filter(key => {
      return key.match(/^references\./);
    }).length, 1);

    assert.equal(Object.keys(fakeLocalStorage).filter(key => {
      return key.match(/^carts\./);
    }).length, 1);

    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});

test('it recovers from broken state when a reference exists to a non-existent cart', function (assert) {
  assert.expect(6);

  const done = assert.async();

  const cartReferenceKey = `references.${config.domain}.recent-cart`;
  const cartId = 'carts.shopify-buy.123';

  const cartRef = {
    referenceId: cartId.replace('carts.', ''),
    [GUID_KEY]: cartReferenceKey
  };

  fakeLocalStorage[cartReferenceKey] = JSON.stringify(cartRef);

  assert.equal(Object.keys(fakeLocalStorage).length, 1);

  shopClient.fetchRecentCart().then(cart => {
    assert.equal(Object.keys(fakeLocalStorage).length, 2);

    assert.ok(cart);
    assert.ok(CartModel.prototype.isPrototypeOf(cart));

    assert.equal(Object.keys(fakeLocalStorage).filter(key => {
      return key.match(/^references\./);
    }).length, 1);

    assert.equal(Object.keys(fakeLocalStorage).filter(key => {
      return key.match(/^carts\./);
    }).length, 1);

    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});

test('it properly transforms line items LineItem instances when fetched', function (assert) {
  assert.expect(7);

  const done = assert.async();

  const cartReferenceKey = `references.${config.domain}.recent-cart`;
  const cartId = 'carts.shopify-buy.123';

  const cartAttrs = {
    cart: {
      line_items: [{
        id: 3,
        image: 'http://google.com/image.png',
        variant_id: 12345,
        product_id: 45678,
        title: 'Some Product',
        quantity: 1,
        properties: {},
        variant_title: 'Red / Small',
        price: '12.00',
        compare_at_price: '',
        line_price: '12.00',
        grams: 4
      }]
    }
  };

  const cartRef = {
    referenceId: cartId.replace('carts.', ''),
    [GUID_KEY]: cartReferenceKey
  };

  fakeLocalStorage[cartReferenceKey] = JSON.stringify(cartRef);
  fakeLocalStorage[cartId] = JSON.stringify(cartAttrs);

  shopClient.fetchRecentCart().then(cart => {
    assert.deepEqual(cart.attrs, cartAttrs.cart);

    assert.equal(cart.lineItems[0].price, '12.00');
    assert.equal(cart.lineItems[0].line_price, '12.00');
    assert.equal(cart.lineItems[0].quantity, 1);

    cart.lineItems[0].quantity = 2;

    assert.equal(cart.lineItems[0].price, '12.00');
    assert.equal(cart.lineItems[0].line_price, '24.00', 'line_price is a getter that computes from price and quantity');
    assert.equal(cart.lineItems[0].quantity, 2);

    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});
