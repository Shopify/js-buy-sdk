import { module, test } from 'qunit';
import CartModel from 'shopify-buy/models/cart-model';
import BaseModel from 'shopify-buy/models/base-model';
import CartLineItemModel from 'shopify-buy/models/cart-line-item-model';
import assign from 'shopify-buy/metal/assign';
import globalVars from 'shopify-buy/metal/global-vars';
import { cartFixture } from '../../fixtures/cart-fixture';
import { singleProductFixture } from '../../fixtures/product-fixture';

let model;
let shopClient;

const { getItem, setItem, removeItem } = localStorage;
const storage = {};
const config = {
  domain: 'buckets-o-stuff.myshopify.com',
  accessToken: 'abc123'
};

module('Unit | CartModel', {
  setup() {
    shopClient = {
      update(type, updatedModel) {
        return new Promise(function (resolve) {
          resolve(new CartModel(assign({}, updatedModel.attrs), { shopClient }));
        });
      }
    };

    model = new CartModel(assign({}, cartFixture.cart), { shopClient, config });
    model.attrs.line_items = cartFixture.cart.line_items.map(item => {
      return assign({}, item);
    });

    localStorage.getItem = function (key) {
      return storage[key];
    };
    localStorage.setItem = function (key, value) {
      storage[key] = value;
    };
    localStorage.setItem = function (key) {
      delete storage[key];
    };
  },
  teardown() {
    shopClient = null;
    model = null;
    localStorage.getItem = getItem;
    localStorage.setItem = setItem;
    localStorage.removeItem = removeItem;
  }
});

test('it extends from BaseModel', function (assert) {
  assert.expect(1);

  assert.ok(BaseModel.prototype.isPrototypeOf(model));
});

test('it transforms attrs.line_items into CartLineItemModel class instances', function (assert) {
  assert.expect(1 + cartFixture.cart.line_items.length);

  assert.deepEqual(model.lineItems.length, cartFixture.cart.line_items.length);

  model.lineItems.forEach(item => {
    assert.ok(CartLineItemModel.prototype.isPrototypeOf(item));
  });
});

test('it proxies sub total from the underlying cart', function (assert) {
  assert.expect(1);

  assert.equal(model.subtotal, cartFixture.cart.subtotal_price);
});

test('it deprecates addVariants to createLineItemsFromVariants', function (assert) {
  assert.expect(3);

  const done = assert.async();

  const variant = singleProductFixture.product_listing.variants[1];
  const quantity = 2;
  const initialLineItems = model.lineItems.filter(lineItem => {
    return lineItem.variant_id === variant.id;
  });
  let quantityInitial = 0;

  if (initialLineItems.length === 1) {
    quantityInitial = initialLineItems[0].quantity;
  }

  model.addVariants({ variant, quantity }).then(cart => {
    assert.equal(cart, model, 'it should be the same model, with updated attrs');
    assert.equal(cart.lineItems.length, 2);
    assert.equal(cart.lineItems.filter(item => {
      return item.variant_id === variant.id && item.quantity === quantity + quantityInitial;
    }).length, 1, 'the line item exists');

    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});

test('it creates a line item when you add a variant', function (assert) {
  assert.expect(3);

  const done = assert.async();

  const variant = singleProductFixture.product_listing.variants[1];
  const quantity = 2;
  const initialLineItems = model.lineItems.filter(lineItem => {
    return lineItem.variant_id === variant.id;
  });
  let quantityInitial = 0;

  if (initialLineItems.length === 1) {
    quantityInitial = initialLineItems[0].quantity;
  }

  model.addVariants({ variant, quantity }).then(cart => {
    assert.equal(cart, model, 'it should be the same model, with updated attrs');
    assert.equal(cart.lineItems.length, 2);
    assert.equal(cart.lineItems.filter(item => {
      return item.variant_id === variant.id && item.quantity === quantity + quantityInitial;
    }).length, 1, 'the line item exists');

    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});

test('it returns correct lineItemCount', function (assert) {
  assert.expect(2);
  const done = assert.async();

  assert.equal(model.lineItemCount, 1);

  const quantity = 8;
  const variant = singleProductFixture.product_listing.variants[1];

  model.createLineItemsFromVariants({ variant, quantity }).then(cart => {
    assert.equal(cart.lineItemCount, 9);
    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });

});

test('it updates line item quantities', function (assert) {
  assert.expect();

  const done = assert.async();

  const id = model.lineItems[0].id;
  const quantity = 4;

  model.updateLineItem(id, quantity).then(cart => {
    assert.equal(cart, model, 'it should be the same model, with updated attrs');
    assert.equal(cart.lineItems.length, 1, 'it doesn\'t create a new line item');
    assert.equal(cart.lineItems[0].quantity, quantity);

    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});

test('it removes a single line item by id', function (assert) {
  assert.expect();

  const done = assert.async();

  const id = model.lineItems[0].id;

  model.removeLineItem(id).then(cart => {
    assert.equal(cart, model, 'it should be the same model, with updated attrs');
    assert.equal(cart.lineItems.length, 0, 'it removes the only line item');
    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});


test('it removes all line items', function (assert) {
  assert.expect(2);

  const done = assert.async();

  model.clearLineItems().then(cart => {
    assert.equal(cart, model, 'it should be the same model, with updated attrs');
    assert.deepEqual(cart.lineItems, [], 'it removes all line items');
    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});

test('it dedupes line items with the same variant_id when added together', function (assert) {
  assert.expect(3);

  const done = assert.async();

  const quantity = 1;
  const variant = singleProductFixture.product_listing.variants[1];

  model.createLineItemsFromVariants({ variant, quantity }, { variant, quantity }).then(cart => {
    assert.equal(cart, model, 'it should be the same model, with updated attrs');
    assert.equal(cart.lineItems.length, 2);
    assert.equal(cart.lineItems.filter(item => {
      return item.variant_id === variant.id && item.quantity === (quantity * 2);
    }).length, 1, 'the line item exists with summed quantities');

    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});

test('it dedupes line items with the same variant_id when added one after another', function (assert) {
  assert.expect(3);

  const done = assert.async();

  // Variant-0 is already in the cart fixture
  const variant = singleProductFixture.product_listing.variants[0];
  const quantity = 1;
  const summedQuantity = quantity + cartFixture.cart.line_items[0].quantity;
  const properties = assign({}, cartFixture.cart.line_items[0].properties);

  model.createLineItemsFromVariants({ variant, quantity, properties }).then(cart => {
    assert.equal(cart, model, 'it should be the same model, with updated attrs');
    assert.equal(cart.lineItems.length, 1, 'we\'re adding to the existing line_item');
    assert.equal(cart.lineItems.filter(item => {
      return item.variant_id === variant.id && item.quantity === summedQuantity;
    }).length, 1, 'the line item exists with summed quantities');

    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});

test('it treats line_items with same variant_ids and different properties as different', function (assert) {
  assert.expect(4);

  const done = assert.async();

  const variant = singleProductFixture.product_listing.variants[1];
  const quantity = 1;
  const propertiesOne = { prop: 'engraving="awesome engraving"' };
  const propertiesTwo = { prop: 'custom_color=shmurple' };
  const items = [{
    variant,
    quantity,
    properties: propertiesOne
  }, {
    variant,
    quantity,
    properties: propertiesTwo
  }];

  model.createLineItemsFromVariants(...items).then(cart => {
    assert.equal(cart, model, 'it should be the same model, with updated attrs');
    assert.equal(cart.lineItems.length, 3);
    assert.equal(cart.lineItems.filter(item => {
      return item.variant_id === variant.id && item.quantity === quantity && item.properties === propertiesOne;
    }).length, 1, 'line item with props one exists');
    assert.equal(cart.lineItems.filter(item => {
      return item.variant_id === variant.id && item.quantity === quantity && item.properties === propertiesTwo;
    }).length, 1, 'line item with props two exists');

    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});

test('it removes the line item if the quantity isn\'t at least one', function (assert) {
  assert.expect(2);

  const done = assert.async();

  const id = model.lineItems[0].id;
  const quantity = 0;

  model.updateLineItem(id, quantity).then(cart => {
    assert.equal(cart, model, 'it should be the same model, with updated attrs');
    assert.equal(cart.lineItems.length, 0, 'it doesn\'t create a new line item');

    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});

test('it generates checkout permalinks', function (assert) {
  assert.expect(2);

  const done = assert.async();

  const baseUrl = `https://${config.domain}/cart`;
  const variantId = model.lineItems[0].variant_id;
  const quantity = model.lineItems[0].quantity;
  const query = `access_token=${config.accessToken}&_fd=0`;

  assert.equal(model.checkoutUrl, `${baseUrl}/${variantId}:${quantity}?${query}`);

  const variant = singleProductFixture.product_listing.variants[1];

  model.createLineItemsFromVariants({ variant, quantity: 1 }).then(cart => {
    const checkoutVariantPath = cart.lineItems.map(lineItem => {
      return `${lineItem.variant_id}:${lineItem.quantity}`;
    }).join(',');

    assert.equal(cart.checkoutUrl, `${baseUrl}/${checkoutVariantPath}?${query}`);

    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');

    done();
  });
});

test('it detects google analytics and appends the cross-domain linker param', function (assert) {
  assert.expect(2);

  const done = assert.async();

  const baseUrl = `https://${config.domain}/cart`;
  const variantId = model.lineItems[0].variant_id;
  const quantity = model.lineItems[0].quantity;
  const query = `access_token=${config.accessToken}&_fd=0`;
  const linkerParam = 'ga=some-linker-param';

  assert.equal(model.checkoutUrl, `${baseUrl}/${variantId}:${quantity}?${query}`);

  const variant = singleProductFixture.product_listing.variants[1];

  globalVars.set('ga', function (callback) {
    const tracker = {
      get() {
        return linkerParam;
      }
    };

    callback(tracker);
  });

  model.createLineItemsFromVariants({ variant, quantity: 1 }).then(cart => {
    const checkoutVariantPath = cart.lineItems.map(lineItem => {
      return `${lineItem.variant_id}:${lineItem.quantity}`;
    }).join(',');

    assert.equal(cart.checkoutUrl, `${baseUrl}/${checkoutVariantPath}?${query}&${linkerParam}`);

    globalVars.set('ga', null);

    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');

    globalVars.set('ga', null);

    done();
  });
});

test('it keeps line_item attrs hashes, and doesn\'t inject classes into internal state', function (assert) {
  assert.expect(5);

  const done = assert.async();

  const quantity = 1;
  const variantOne = singleProductFixture.product_listing.variants[0];
  const variantTwo = singleProductFixture.product_listing.variants[1];

  model.createLineItemsFromVariants({ variant: variantOne, quantity }).then(_cart => {
    _cart.createLineItemsFromVariants({ variant: variantTwo, quantity }).then(cart => {
      assert.equal(cart.lineItems.length, 2);

      cart.lineItems.forEach(item => {
        assert.ok(CartLineItemModel.prototype.isPrototypeOf(item));
      });

      cart.attrs.line_items.forEach(item => {
        assert.notOk(CartLineItemModel.prototype.isPrototypeOf(item));
      });

      done();
    });

  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});


test('it doesn\'t pollute "attrs.line_items" with "CartLineItem" class instances on #removeLineItem', function (assert) {
  assert.expect(4);

  const done = assert.async();

  const quantity = 1;
  const variantOne = singleProductFixture.product_listing.variants[0];
  const variantTwo = singleProductFixture.product_listing.variants[1];

  model.createLineItemsFromVariants({ variant: variantOne, quantity }, { variant: variantTwo, quantity }).then(cart => {
    assert.equal(cart.lineItems.length, 2);
    cart.removeLineItem(cart.lineItems[0].id);
    assert.equal(cart.lineItems.length, 1);

    cart.lineItems.forEach(item => {
      assert.ok(CartLineItemModel.prototype.isPrototypeOf(item));
    });

    cart.attrs.line_items.forEach(item => {
      assert.notOk(CartLineItemModel.prototype.isPrototypeOf(item));
    });

    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });

});
