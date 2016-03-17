import { module, test } from 'qunit';
import CartSerializer from 'shopify-buy/serializers/cart-serializer';
import CartModel from 'shopify-buy/models/cart-model';

let serializer;

module('Unit | CartSerializer', {
  setup() {
    serializer = new CartSerializer();
  },
  teardown() {
    serializer = null;
  }
});


const cartFixture = {
  cart: {
    line_items: []
  }
};

test('it discovers the root key from the type', function (assert) {
  assert.expect(1);

  assert.equal(serializer.rootKeyForType('carts'), 'cart');
});

test('it returns CartModel for cart type', function (assert) {
  assert.expect(1);

  assert.equal(serializer.modelForType('carts'), CartModel);
});

test('it transforms a single item payload into a cart object.', function (assert) {
  assert.expect(2);

  const model = serializer.deserializeSingle('carts', cartFixture);

  assert.notOk(Array.isArray(model), 'should not be an array');
  assert.deepEqual(model.attrs, cartFixture.cart);
});

test('it attaches a reference of the passed serializer to the model on #deserializeSingle', function (assert) {
  assert.expect(1);

  const model = serializer.deserializeSingle('carts', cartFixture, { serializer });

  assert.deepEqual(model.serializer, serializer);
});

test('it attaches a reference of the passed shopClient to the model on #deserializeSingle', function (assert) {
  assert.expect(1);

  const shopClient = 'some-shop-client';

  const model = serializer.deserializeSingle('carts', cartFixture, { shopClient });

  assert.equal(model.shopClient, shopClient);
});

test('it transforms a model into a payload on #serialize using the root key', function (assert) {
  const updatedModel = new CartModel({
    line_items: [
      {
        variant_id: 123456789,
        quantity: 1
      }
    ]
  });

  const payload = serializer.serialize('carts', updatedModel);

  assert.deepEqual(payload, { cart: updatedModel.attrs });
});
