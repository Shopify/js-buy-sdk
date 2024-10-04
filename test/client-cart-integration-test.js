import assert from 'assert';
import Client from '../src/client';
import fetchMock from './isomorphic-fetch-mock'; // eslint-disable-line import/no-unresolved
import fetchMockPostOnce from './fetch-mock-helper';

// fixtures
import cartFixture from '../fixtures/cart-fixture';
import cartNullFixture from '../fixtures/node-null-fixture';
import cartCreateFixture from '../fixtures/cart-create-fixture';
import cartCreateInvalidVariantIdErrorFixture from '../fixtures/cart-create-invalid-variant-id-error-fixture';
import cartUpdateAttributesFixture from '../fixtures/cart-update-attrs-fixture';
import cartUpdateBuyerIdentityFixture from '../fixtures/cart-update-buyer-identity-fixture';
import cartUpdateBuyerIdentityFixtureWithUserErrors from '../fixtures/cart-update-buyer-identity-fixture-with-user-errors';
import cartLineItemsAddFixture from '../fixtures/cart-line-items-add-fixture';
import cartLineItemsAddFixtureWithUserErrors from '../fixtures/cart-line-items-add-fixture-with-user-errors';
import cartLineItemsUpdateFixture from '../fixtures/cart-line-items-update-fixture';
import cartLineItemsUpdateFixtureWithUserErrors from '../fixtures/cart-line-items-update-fixture-with-user-errors';
import cartLineItemsRemoveFixture from '../fixtures/cart-line-items-remove-fixture';
import cartUpdateDiscountCodesFixture from '../fixtures/cart-update-discount-codes-fixture';
import cartUpdateNoteFixture from '../fixtures/cart-update-note-fixture';
import cartUpdateSelectedDeliveryOptionsFixture from '../fixtures/cart-update-selected-delivery-options-fixture';

suite('client-cart-integration-test', () => {
  const domain = 'client-integration-tests.myshopify.io';
  const config = {
    storefrontAccessToken: 'abc123',
    domain
  };
  let client;
  let apiUrl;

  setup(() => {
    client = Client.buildClient(config);
    apiUrl = `https://${domain}/api/${client.config.apiVersion}/graphql`;
    fetchMock.reset();
  });

  teardown(() => {
    client = null;
    fetchMock.restore();
  });

  test('it resolves with a cart on Client.cart#fetch', () => {
    fetchMockPostOnce(fetchMock, apiUrl, cartFixture);
    const cartId = cartFixture.data.node.id;

    return client.cart.fetch(cartId).then((cart) => {
      assert.equal(cart.id, cartId);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with null on Client.checkout#fetch for a bad checkoutId', () => {
    fetchMockPostOnce(fetchMock, apiUrl, cartNullFixture);

    const cartId = cartFixture.data.node.id;

    return client.cart.fetch(cartId).then((cart) => {
      assert.equal(cart, null);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with a cart on Client.cart#create', () => {
    const input = {
      lines: [
        {
          merchandiseId: 'an-id',
          quantity: 5
        }
      ],
      note: 'This is a note!',
      deliveryAddressPreferences: {
        deliveryAddress: {}
      }
    };

    fetchMockPostOnce(fetchMock, apiUrl, cartCreateFixture);

    return client.cart.create(input).then((cart) => {
      assert.equal(cart.id, cartCreateFixture.data.cartCreate.cart.id);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolve with user errors on Client.cart#create when merchandiseId is invalid', () => {
    const input = {
      lines: [
        {
          merchandiseId: 'a-bad-id',
          quantity: 5
        }
      ]
    };

    fetchMockPostOnce(fetchMock, apiUrl, cartCreateInvalidVariantIdErrorFixture);

    return client.cart.create(input).then(() => {
      assert.ok(false, 'Promise should not resolve');
    }).catch((error) => {
      assert.equal(error.message, '[{"message":"Variable input of type CartInput! was provided invalid value"}]');
    });
  });

  test('it resolves with a checkout on Client.cart#updateAttributes', () => {
    const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSE5WWTAyVjlETjFDNVowVFZEWVMwMVJR';
    const attributes = [{key: 'MyKey', value: 'MyValue'}];

    fetchMockPostOnce(fetchMock, apiUrl, cartUpdateAttributesFixture);

    return client.cart.updateAttributes(cartId, attributes).then((cart) => {
      assert.equal(cart.id, cartUpdateAttributesFixture.data.cartAttributesUpdate.cart.id);
      assert.equal(cart.attributes[0].key, cartUpdateAttributesFixture.data.cartAttributesUpdate.cart.attributes[0].key);
      assert.equal(cart.attributes[0].value, cartUpdateAttributesFixture.data.cartAttributesUpdate.cart.attributes[0].value);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with a cart on Client.cart#updateBuyerIdentity', () => {
    const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSE5WWTAyVjlETjFDNVowVFZEWVMwMVJR';
    const buyerIdentity = {
      email: 'hi@hello.com'
    };

    fetchMockPostOnce(fetchMock, apiUrl, cartUpdateBuyerIdentityFixture);

    return client.cart.updateBuyerIdentity(cartId, buyerIdentity).then((cart) => {
      assert.equal(cart.id, cartUpdateBuyerIdentityFixture.data.cartBuyerIdentityUpdate.cart.id);
      assert.equal(cart.buyerIdentity.email, cartUpdateBuyerIdentityFixture.data.cartBuyerIdentityUpdate.cart.buyerIdentity.email);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with user errors on Client.cart#updateBuyerIdentity when email is invalid', () => {
    const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSE5WWTAyVjlETjFDNVowVFZEWVMwMVJR';
    const buyerIdentity = {
      email: 'invalid-email'
    };

    fetchMockPostOnce(fetchMock, apiUrl, cartUpdateBuyerIdentityFixtureWithUserErrors);

    return client.cart.updateBuyerIdentity(cartId, buyerIdentity).then(() => {
      assert.ok(false, 'Promise should not resolve');
    }).catch((error) => {
      assert.equal(error.message, '[{"field":["buyerIdentity","email"],"message":"Email is invalid","code":"INVALID"}]');
    });
  });

  test('it resolves with a cart on Client.cart#addLineItems', () => {
    const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSFA1UFBYVE1ZTkRBVkFHMlNIQ1RENE0y';
    const lineItems = [
      {merchandiseId: 'id1', quantity: 5},
      {merchandiseId: 'id2', quantity: 2}
    ];

    fetchMockPostOnce(fetchMock, apiUrl, cartLineItemsAddFixture);

    return client.cart.addLineItems(cartId, lineItems).then((cart) => {
      assert.equal(cart.id, cartId);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolve with user errors on Client.cart#addLineItems when merchandise ID is invalid', () => {
    const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSFA1UFBYVE1ZTkRBVkFHMlNIQ1RENE0y';
    const lineItems = [
      {merchandiseId: 'gid://shopify/ProductVariant/invalid-id', quantity: 1}
    ];

    fetchMockPostOnce(fetchMock, apiUrl, cartLineItemsAddFixtureWithUserErrors);

    return client.cart.addLineItems(cartId, lineItems).then(() => {
      assert.ok(false, 'Promise should not resolve');
    }).catch((error) => {
      assert.equal(error.message, '[{"field":["lines","0","merchandiseId"],"message":"The merchandise with id gid://shopify/ProductVariant/invalid-id does not exist.","code":"INVALID"}]');
    });
  });

  test('it resolves with a cart on Client.cart#updateLineItems', () => {
    const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSFA1UFBYVE1ZTkRBVkFHMlNIQ1RENE0y';
    const lineItems = [
      {merchandiseId: 'id1', quantity: 5},
      {merchandiseId: 'id2', quantity: 2}
    ];

    fetchMockPostOnce(fetchMock, apiUrl, cartLineItemsUpdateFixture);

    return client.cart.updateLineItems(cartId, lineItems).then((cart) => {
      assert.equal(cart.id, cartId);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolve with user errors on Client.cart#updateLineItems when merchandise ID is invalid', () => {
    const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSFA1UFBYVE1ZTkRBVkFHMlNIQ1RENE0y';
    const lineItems = [
      {merchandiseId: 'gid://shopify/ProductVariant/invalid-id', quantity: 1}
    ];

    fetchMockPostOnce(fetchMock, apiUrl, cartLineItemsUpdateFixtureWithUserErrors);

    return client.cart.updateLineItems(cartId, lineItems).then(() => {
      assert.ok(false, 'Promise should not resolve');
    }).catch((error) => {
      assert.equal(error.message, '[{"field":["lines","0","merchandiseId"],"message":"The merchandise with id gid://shopify/ProductVariant/invalid-id does not exist.","code":"INVALID"}]');
    });
  });

  test('it resolves with a cart on Client.cart#removeLineItems', () => {
    const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSFA1UFBYVE1ZTkRBVkFHMlNIQ1RENE0y';
    const linesToRemove = ['gid://shopify/CartLine/ff20f2b0-a16f-4127-8f5c-3ae00596fcb9?cart=Z2NwLXVzLWVhc3QxOjAxSFA1UFBYVE1ZTkRBVkFHMlNIQ1RENE0y'];

    fetchMockPostOnce(fetchMock, apiUrl, cartLineItemsRemoveFixture);

    return client.cart.removeLineItems(cartId, linesToRemove).then((cart) => {
      assert.equal(cart.id, cartId);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with a cart on Client.cart#removeLineItems', () => {
    const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSFA1UFBYVE1ZTkRBVkFHMlNIQ1RENE0y';
    const linesToRemove = ['gid://shopify/CartLine/ff20f2b0-a16f-4127-8f5c-3ae00596fcb9?cart=Z2NwLXVzLWVhc3QxOjAxSFA1UFBYVE1ZTkRBVkFHMlNIQ1RENE0y'];

    fetchMockPostOnce(fetchMock, apiUrl, cartLineItemsRemoveFixture);

    return client.cart.removeLineItems(cartId, linesToRemove).then((cart) => {
      assert.equal(cart.id, cartId);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with a cart on Client.cart#updateDiscountCodes', () => {
    const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSE5WWTAyVjlETjFDNVowVFZEWVMwMVJR';
    const discountCodes = ['10OFF'];

    fetchMockPostOnce(fetchMock, apiUrl, cartUpdateDiscountCodesFixture);

    return client.cart.updateDiscountCodes(cartId, discountCodes).then((cart) => {
      assert.equal(cart.id, cartUpdateDiscountCodesFixture.data.cartDiscountCodesUpdate.cart.id);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with a cart on Client.cart#updateNote', () => {
    const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSE5WWTAyVjlETjFDNVowVFZEWVMwMVJR';
    const note = 'This is a note!';

    fetchMockPostOnce(fetchMock, apiUrl, cartUpdateNoteFixture);

    return client.cart.updateNote(cartId, note).then((cart) => {
      assert.equal(cart.id, cartUpdateNoteFixture.data.cartNoteUpdate.cart.id);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with a cart on Client.cart#updateSelectedDeliveryOptions', () => {
    const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSE5WWTAyVjlETjFDNVowVFZEWVMwMVJR';
    const selectedDeliveryOptions = [{deliveryGroupId: 'gid://shopify/CartDeliveryGroup/269ea2856c41d63937d1ba5212c29713', deliveryOptionHandle: 'standard'}];

    fetchMockPostOnce(fetchMock, apiUrl, cartUpdateSelectedDeliveryOptionsFixture);

    return client.cart.updateSelectedDeliveryOptions(cartId, selectedDeliveryOptions).then((cart) => {
      assert.equal(cart.id, cartUpdateSelectedDeliveryOptionsFixture.data.cartSelectedDeliveryOptionsUpdate.cart.id);
      assert.ok(fetchMock.done());
    });
  });
});
