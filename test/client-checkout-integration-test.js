import assert from 'assert';
import Client from '../src/client';
import fetchMock from './isomorphic-fetch-mock'; // eslint-disable-line import/no-unresolved

// fixtures
import checkoutFixture from '../fixtures/checkout-fixture';
import checkoutNullFixture from '../fixtures/node-null-fixture';
import checkoutCreateFixture from '../fixtures/checkout-create-fixture';
import checkoutCreateWithPaginatedLineItemsFixture from '../fixtures/checkout-create-with-paginated-line-items-fixture';
import {secondPageLineItemsFixture, thirdPageLineItemsFixture} from '../fixtures/paginated-line-items-fixture';
import checkoutLineItemsAddFixture from '../fixtures/checkout-line-items-add-fixture';
import checkoutLineItemsUpdateFixture from '../fixtures/checkout-line-items-update-fixture';
import checkoutLineItemsRemoveFixture from '../fixtures/checkout-line-items-remove-fixture';
import checkoutLineItemsReplaceFixture from '../fixtures/checkout-line-items-replace-fixture';
import checkoutUpdateAttributesV2Fixture from '../fixtures/checkout-update-custom-attrs-fixture';
import checkoutUpdateEmailV2Fixture from '../fixtures/checkout-update-email-fixture';
import checkoutDiscountCodeApplyV2Fixture from '../fixtures/checkout-discount-code-apply-fixture';
import checkoutDiscountCodeRemoveFixture from '../fixtures/checkout-discount-code-remove-fixture';
import checkoutShippingAddressUpdateV2Fixture from '../fixtures/checkout-shipping-address-update-v2-fixture';
import checkoutShippingAdddressUpdateV2WithUserErrorsFixture from '../fixtures/checkout-shipping-address-update-v2-with-user-errors-fixture';

suite('client-checkout-integration-test', () => {
  const domain = 'client-integration-tests.myshopify.io';
  const apiUrl = `https://${domain}/api/graphql`;
  const config = {
    storefrontAccessToken: 'abc123',
    domain
  };
  const shippingAddress = {
    address1: 'Chestnut Street 92',
    address2: 'Apartment 2',
    city: 'Louisville',
    company: null,
    country: 'United States',
    firstName: 'Bob',
    lastName: 'Norman',
    phone: '555-625-1199',
    province: 'Kentucky',
    zip: '40202'
  };
  let client;

  setup(() => {
    client = Client.buildClient(config);
    fetchMock.reset();
  });

  teardown(() => {
    client = null;
    fetchMock.restore();
  });

  test('it resolves with a checkout on Client.checkout#fetch', () => {
    fetchMock.postOnce(apiUrl, checkoutFixture);

    const checkoutId = checkoutFixture.data.node.id;

    return client.checkout.fetch(checkoutId).then((checkout) => {
      assert.equal(checkout.id, checkoutId);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with null on Client.checkout#fetch for a bad checkoutId', () => {
    fetchMock.postOnce(apiUrl, checkoutNullFixture);

    const checkoutId = checkoutFixture.data.node.id;

    return client.checkout.fetch(checkoutId).then((checkout) => {
      assert.equal(checkout, null);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with a checkout on Client.checkout#create', () => {
    const input = {
      lineItems: [
        {
          variantId: 'an-id',
          quantity: 5
        }
      ],
      shippingAddress: {}
    };

    fetchMock.postOnce(apiUrl, checkoutCreateFixture);

    return client.checkout.create(input).then((checkout) => {
      assert.equal(checkout.id, checkoutCreateFixture.data.checkoutCreate.checkout.id);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with a checkout on Client.checkout#update', () => {
    const checkoutId = 'Z2lkOi8vU2hvcGlmeS9FeGFtcGxlLzE=';
    const input = {
      lineItems: [
        {variantId: 'an-id', quantity: 5}
      ],
      customAttributes: [
        {key: 'MyKey', value: 'MyValue'}
      ]
    };

    fetchMock.postOnce(apiUrl, checkoutUpdateAttributesV2Fixture);

    return client.checkout.updateAttributes(checkoutId, input).then((checkout) => {
      assert.equal(checkout.id, checkoutUpdateAttributesV2Fixture.data.checkoutAttributesUpdateV2.checkout.id);
      assert.equal(checkout.customAttributes[0].key, checkoutUpdateAttributesV2Fixture.data.checkoutAttributesUpdateV2.checkout.customAttributes[0].key);
      assert.equal(checkout.customAttributes[0].value, checkoutUpdateAttributesV2Fixture.data.checkoutAttributesUpdateV2.checkout.customAttributes[0].value);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with a checkout on Client.checkout#email_update', () => {
    const checkoutId = 'Z2lkOi8vU2hvcGlmeS9FeGFtcGxlLzE=';
    const input = {
      email: 'user@example.com'
    };

    fetchMock.postOnce(apiUrl, checkoutUpdateEmailV2Fixture);

    return client.checkout.updateEmail(checkoutId, input).then((checkout) => {
      assert.equal(checkout.id, checkoutUpdateEmailV2Fixture.data.checkoutEmailUpdateV2.checkout.id);
      assert.equal(checkout.email, checkoutUpdateEmailV2Fixture.data.checkoutEmailUpdateV2.checkout.email);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with a checkout on Client.checkout#addLineItems', () => {
    const checkoutId = checkoutLineItemsAddFixture.data.checkoutLineItemsAdd.checkout.id;
    const lineItems = [
      {variantId: 'id1', quantity: 5},
      {variantId: 'id2', quantity: 2}
    ];

    fetchMock.postOnce(apiUrl, checkoutLineItemsAddFixture);

    return client.checkout.addLineItems(checkoutId, lineItems).then((checkout) => {
      assert.equal(checkout.id, checkoutId);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with a checkout on Client.checkout#replaceLineItems', () => {
    const checkoutId = checkoutLineItemsReplaceFixture.data.checkoutLineItemsReplace.checkout.id;
    const lineItems = [
      {variantId: 'id1', quantity: 5},
      {variantId: 'id2', quantity: 2}
    ];

    fetchMock.postOnce(apiUrl, checkoutLineItemsReplaceFixture);

    return client.checkout.replaceLineItems(checkoutId, lineItems).then((checkout) => {
      assert.equal(checkout.id, checkoutId);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with a checkout on Client.checkout#updateLineItems', () => {
    fetchMock.postOnce(apiUrl, checkoutLineItemsUpdateFixture);

    const checkoutId = checkoutLineItemsUpdateFixture.data.checkoutLineItemsUpdate.checkout.id;
    const lineItems = [
      {
        id: 'id1',
        quantity: 2,
        variantId: 'variant-id'
      }
    ];

    return client.checkout.updateLineItems(checkoutId, lineItems).then((checkout) => {
      assert.equal(checkout.id, checkoutId);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with a checkout on Client.checkout#removeLineItems', () => {
    fetchMock.postOnce(apiUrl, checkoutLineItemsRemoveFixture);

    const checkoutId = checkoutLineItemsRemoveFixture.data.checkoutLineItemsRemove.checkout.id;

    return client.checkout.removeLineItems(checkoutId, ['line-item-id']).then((checkout) => {
      assert.equal(checkout.id, checkoutId);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with a checkout on Client.checkout#addDiscount', () => {
    fetchMock.postOnce(apiUrl, checkoutDiscountCodeApplyV2Fixture);

    const checkoutId = checkoutDiscountCodeApplyV2Fixture.data.checkoutDiscountCodeApplyV2.checkout.id;
    const discountCode = 'TENPERCENTOFF';

    return client.checkout.addDiscount(checkoutId, discountCode).then((checkout) => {
      assert.equal(checkout.id, checkoutId);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with checkoutUserErrors on Client.checkout#addDiscount with an invalid code', () => {
    const checkoutDiscountCodeApplyV2WithCheckoutUserErrorsFixture = {
      data: {
        checkoutDiscountCodeApplyV2: {
          checkoutUserErrors: [
            {
              message: 'Discount code Unable to find a valid discount matching the code entered',
              field: ['discountCode'],
              code: 'DISCOUNT_NOT_FOUND'
            }
          ],
          userErrors: [
            {
              message: 'Discount code Unable to find a valid discount matching the code entered',
              field: ['discountCode']
            }
          ],
          checkout: null
        }
      }
    };

    fetchMock.postOnce(apiUrl, checkoutDiscountCodeApplyV2WithCheckoutUserErrorsFixture);

    const checkoutId = checkoutDiscountCodeApplyV2Fixture.data.checkoutDiscountCodeApplyV2.checkout.id;
    const discountCode = 'INVALIDCODE';

    return client.checkout.addDiscount(checkoutId, discountCode).then(() => {
      assert.ok(false, 'Promise should not resolve');
    }).catch((error) => {
      assert.equal(error.message, '[{"message":"Discount code Unable to find a valid discount matching the code entered","field":["discountCode"],"code":"DISCOUNT_NOT_FOUND"}]');
    });
  });

  test('it resolves with a checkout on Client.checkout#removeDiscount', () => {
    fetchMock.postOnce(apiUrl, checkoutDiscountCodeRemoveFixture);

    const checkoutId = checkoutDiscountCodeRemoveFixture.data.checkoutDiscountCodeRemove.checkout.id;

    return client.checkout.removeDiscount(checkoutId).then((checkout) => {
      assert.equal(checkout.id, checkoutId);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with a checkout on Client.checkout#updateShippingAddress', () => {
    const {id: checkoutId} = checkoutShippingAddressUpdateV2Fixture.data.checkoutShippingAddressUpdateV2.checkout;
    const {
      name: shippingName,
      provinceCode: shippingProvince,
      countryCode: shippingCountry
    } = checkoutShippingAddressUpdateV2Fixture.data.checkoutShippingAddressUpdateV2.checkout.shippingAddress;

    fetchMock.postOnce(apiUrl, checkoutShippingAddressUpdateV2Fixture);

    return client.checkout.updateShippingAddress(checkoutId, shippingAddress).then((checkout) => {
      assert.equal(checkout.id, checkoutId);
      assert.equal(checkout.shippingAddress.name, shippingName);
      assert.equal(checkout.shippingAddress.provinceCode, shippingProvince);
      assert.equal(checkout.shippingAddress.countryCode, shippingCountry);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with userErrors on Client.checkout#updateShippingAddress with invalid address', () => {
    const checkoutId = checkoutShippingAddressUpdateV2Fixture.data.checkoutShippingAddressUpdateV2.checkout.id;

    fetchMock.postOnce(apiUrl, checkoutShippingAdddressUpdateV2WithUserErrorsFixture);

    return client.checkout.updateShippingAddress(checkoutId, shippingAddress).then(() => {
      assert.ok(false, 'Promise should not resolve.');
    }).catch((error) => {
      assert.equal(error.message, '[{"message":"Country is not supported","field":["shippingAddress country"]}]');
    });
  });

  test('it fetches all paginated line items on the checkout on any checkout mutation', () => {
    const input = {
      lineItems: [
        {variantId: 'id1', quantity: 5},
        {variantId: 'id2', quantity: 10},
        {variantId: 'id3', quantity: 15}
      ]
    };

    fetchMock.postOnce(apiUrl, checkoutCreateWithPaginatedLineItemsFixture)
      .postOnce(apiUrl, secondPageLineItemsFixture)
      .postOnce(apiUrl, thirdPageLineItemsFixture);

    return client.checkout.create(input).then(() => {
      assert.ok(fetchMock.done());
    });
  });

  test('it rejects checkout mutations that return with a non-null `userErrors` field', () => {
    const checkoutCreateWithUserErrorsFixture = {
      data: {
        checkoutCreate: {
          userErrors: [
            {
              message: 'Variant is invalid',
              field: [
                'lineItems',
                '0',
                'variantId'
              ]
            }
          ],
          checkout: null
        }
      }
    };

    const input = {
      lineItems: [
        {variantId: 'invalidId', quantity: 5}
      ]
    };

    fetchMock.postOnce(apiUrl, checkoutCreateWithUserErrorsFixture);

    return client.checkout.create(input).then(() => {
      assert.ok(false, 'Promise should not resolve');
    }).catch((error) => {
      assert.equal(error.message, '[{"message":"Variant is invalid","field":["lineItems","0","variantId"]}]');
    });
  });

  test('it rejects checkout mutations that return with a non-null `errors` without data field', () => {
    const checkoutCreateWithUserErrorsFixture = {
      data: {},
      errors: [{message: 'Timeout'}]
    };

    const input = {
      lineItems: [
        {variantId: 'invalidId', quantity: 5}
      ]
    };

    fetchMock.postOnce(apiUrl, checkoutCreateWithUserErrorsFixture);

    return client.checkout.create(input).then(() => {
      assert.ok(false, 'Promise should not resolve');
    }).catch((error) => {
      assert.equal(error.message, '[{"message":"Timeout"}]');
    });
  });

  test('it resolves checkout mutations that return with a non-null `errors` with data field', () => {
    checkoutCreateWithPaginatedLineItemsFixture.errors = [{message: 'Some error'}];

    const input = {
      lineItems: [
        {variantId: 'id1', quantity: 5},
        {variantId: 'id2', quantity: 10},
        {variantId: 'id3', quantity: 15}
      ]
    };

    fetchMock.postOnce(apiUrl, checkoutCreateWithPaginatedLineItemsFixture)
      .postOnce(apiUrl, secondPageLineItemsFixture)
      .postOnce(apiUrl, thirdPageLineItemsFixture);

    return client.checkout.create(input).then((checkout) => {
      assert.ok(checkout.errors);
      assert.ok(fetchMock.done());
    }).catch(() => {
      assert.equal(false, 'Should resolve');
    });
  });
});
