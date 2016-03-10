import { module, test } from 'qunit';
import CheckoutSerializer from 'js-buy-sdk/serializers/checkout-serializer';
import CartModel from 'js-buy-sdk/models/cart-model';

let serializer;

module('Unit | CheckoutSerializer', {
  setup() {
    serializer = new CheckoutSerializer();
  },
  teardown() {
    serializer = null;
  }
});


const checkoutFixture = {
  checkout: {
    line_items: []
  }
};

test('it discovers the root key from the type', function (assert) {
  assert.expect(1);

  assert.equal(serializer.rootKeyForType('checkouts'), 'checkout');
});

test('it returns CartModel for checkout type', function (assert) {
  assert.expect(1);

  assert.equal(serializer.modelForType('checkouts'), CartModel);
});

test('it transforms a single item payload into a checkout object.', function (assert) {
  assert.expect(2);

  const model = serializer.deserializeSingle('checkouts', checkoutFixture);

  assert.notOk(Array.isArray(model), 'should not be an array');
  assert.deepEqual(model.attrs, checkoutFixture.checkout);
});

test('it attaches a reference of the passed serializer to the model on #deserializeSingle', function (assert) {
  assert.expect(1);

  const model = serializer.deserializeSingle('checkouts', checkoutFixture, { serializer });

  assert.deepEqual(model.serializer, serializer);
});

test('it attaches a reference of the passed shopClient to the model on #deserializeSingle', function (assert) {
  assert.expect(1);

  const shopClient = 'some-shop-client';

  const model = serializer.deserializeSingle('checkouts', checkoutFixture, { shopClient });

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

  const payload = serializer.serialize('checkouts', updatedModel);

  assert.deepEqual(payload, { checkout: updatedModel.attrs });
});
