import assert from 'assert';
import Client from '../src/client';
import fetchMock from './isomorphic-fetch-mock'; // eslint-disable-line import/no-unresolved
import fetchMockPostOnce from './fetch-mock-helper';

// fixtures
import checkoutFixture from '../fixtures/checkout-fixture';
import checkoutNullFixture from '../fixtures/node-null-fixture';
import checkoutCreateFixture from '../fixtures/checkout-create-fixture';
import checkoutCreateWithPaginatedLineItemsFixture from '../fixtures/checkout-create-with-paginated-line-items-fixture';
import {secondPageLineItemsFixture, thirdPageLineItemsFixture} from '../fixtures/paginated-line-items-fixture';
import checkoutLineItemsAddFixture from '../fixtures/checkout-line-items-add-fixture';
import checkoutLineItemsAddWithUserErrorsFixture from '../fixtures/checkout-line-items-add-with-user-errors-fixture';
import checkoutLineItemsUpdateFixture from '../fixtures/checkout-line-items-update-fixture';
import checkoutLineItemsUpdateWithUserErrorsFixture from '../fixtures/checkout-line-items-update-with-user-errors-fixture';
import checkoutLineItemsRemoveFixture from '../fixtures/checkout-line-items-remove-fixture';
import checkoutLineItemsRemoveWithUserErrorsFixture from '../fixtures/checkout-line-items-remove-with-user-errors-fixture';
import checkoutLineItemsReplaceFixture from '../fixtures/checkout-line-items-replace-fixture';
import checkoutLineItemsReplaceWithUserErrorsFixture from '../fixtures/checkout-line-items-replace-with-user-errors-fixture';
import checkoutUpdateAttributesV2Fixture from '../fixtures/checkout-update-custom-attrs-fixture';
import checkoutUpdateAttributesV2WithUserErrorsFixture from '../fixtures/checkout-update-custom-attrs-with-user-errors-fixture';
import checkoutUpdateEmailV2Fixture from '../fixtures/checkout-update-email-fixture';
import checkoutUpdateEmailV2WithUserErrorsFixture from '../fixtures/checkout-update-email-with-user-errors-fixture';
import checkoutDiscountCodeApplyV2Fixture from '../fixtures/checkout-discount-code-apply-fixture';
import checkoutDiscountCodeRemoveFixture from '../fixtures/checkout-discount-code-remove-fixture';
import checkoutGiftCardsAppendFixture from '../fixtures/checkout-gift-cards-apply-fixture';
import checkoutGiftCardRemoveV2Fixture from '../fixtures/checkout-gift-card-remove-fixture';
import checkoutShippingAddressUpdateV2Fixture from '../fixtures/checkout-shipping-address-update-v2-fixture';
import checkoutShippingAdddressUpdateV2WithUserErrorsFixture from '../fixtures/checkout-shipping-address-update-v2-with-user-errors-fixture';

suite('client-checkout-integration-test', () => {
  const domain = 'client-integration-tests.myshopify.io';
  const apiVersion = '2019-07';
  const apiUrl = `https://${domain}/api/${apiVersion}/graphql`;
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
    fetchMockPostOnce(fetchMock, apiUrl, checkoutFixture);

    const checkoutId = checkoutFixture.data.node.id;

    return client.checkout.fetch(checkoutId).then((checkout) => {
      assert.equal(checkout.id, checkoutId);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with null on Client.checkout#fetch for a bad checkoutId', () => {
    fetchMockPostOnce(fetchMock, apiUrl, checkoutNullFixture);

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

    fetchMockPostOnce(fetchMock, apiUrl, checkoutCreateFixture);

    return client.checkout.create(input).then((checkout) => {
      assert.equal(checkout.id, checkoutCreateFixture.data.checkoutCreate.checkout.id);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with a checkout on Client.checkout#updateAttributes', () => {
    const checkoutId = 'Z2lkOi8vU2hvcGlmeS9FeGFtcGxlLzE=';
    const input = {
      lineItems: [
        {variantId: 'an-id', quantity: 5}
      ],
      customAttributes: [
        {key: 'MyKey', value: 'MyValue'}
      ]
    };

    fetchMockPostOnce(fetchMock, apiUrl, checkoutUpdateAttributesV2Fixture);

    return client.checkout.updateAttributes(checkoutId, input).then((checkout) => {
      assert.equal(checkout.id, checkoutUpdateAttributesV2Fixture.data.checkoutAttributesUpdateV2.checkout.id);
      assert.equal(checkout.customAttributes[0].key, checkoutUpdateAttributesV2Fixture.data.checkoutAttributesUpdateV2.checkout.customAttributes[0].key);
      assert.equal(checkout.customAttributes[0].value, checkoutUpdateAttributesV2Fixture.data.checkoutAttributesUpdateV2.checkout.customAttributes[0].value);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with user errors on Client.checkout#updateAttributes when input is invalid', () => {
    const checkoutId = checkoutUpdateAttributesV2Fixture.data.checkoutAttributesUpdateV2.checkout.id;
    const input = {
      note: 'Very long note'
    };

    fetchMockPostOnce(fetchMock, apiUrl, checkoutUpdateAttributesV2WithUserErrorsFixture);

    return client.checkout.updateAttributes(checkoutId, input).then(() => {
      assert.ok(false, 'Promise should not resolve');
    }).catch((error) => {
      assert.equal(error.message, '[{"message":"Note is too long (maximum is 5000 characters)","field":["input","note"],"code":"TOO_LONG"}]');
    });
  });

  test('it resolves with a checkout on Client.checkout#updateEmail', () => {
    const checkoutId = 'Z2lkOi8vU2hvcGlmeS9FeGFtcGxlLzE=';
    const input = {
      email: 'user@example.com'
    };

    fetchMockPostOnce(fetchMock, apiUrl, checkoutUpdateEmailV2Fixture);

    return client.checkout.updateEmail(checkoutId, input).then((checkout) => {
      assert.equal(checkout.id, checkoutUpdateEmailV2Fixture.data.checkoutEmailUpdateV2.checkout.id);
      assert.equal(checkout.email, checkoutUpdateEmailV2Fixture.data.checkoutEmailUpdateV2.checkout.email);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolve with user errors on Client.checkout#updateEmail when email is invalid', () => {
    const checkoutId = checkoutUpdateEmailV2Fixture.data.checkoutEmailUpdateV2.checkout.id;

    fetchMockPostOnce(fetchMock, apiUrl, checkoutUpdateEmailV2WithUserErrorsFixture);

    return client.checkout.updateEmail(checkoutId, {email: 'invalid-email'}).then(() => {
      assert.ok(false, 'Promise should not resolve');
    }).catch((error) => {
      assert.equal(error.message, '[{"message":"Email is invalid","field":["email"],"code":"INVALID"}]');
    });
  });

  test('it resolves with a checkout on Client.checkout#addLineItems', () => {
    const checkoutId = checkoutLineItemsAddFixture.data.checkoutLineItemsAdd.checkout.id;
    const lineItems = [
      {variantId: 'id1', quantity: 5},
      {variantId: 'id2', quantity: 2}
    ];

    fetchMockPostOnce(fetchMock, apiUrl, checkoutLineItemsAddFixture);

    return client.checkout.addLineItems(checkoutId, lineItems).then((checkout) => {
      assert.equal(checkout.id, checkoutId);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolve with user errors on Client.checkout#addLineItems when variant is invalid', () => {
    const checkoutId = checkoutLineItemsAddFixture.data.checkoutLineItemsAdd.checkout.id;
    const lineItems = [
      {variantId: '', quantity: 1}
    ];

    fetchMockPostOnce(fetchMock, apiUrl, checkoutLineItemsAddWithUserErrorsFixture);

    return client.checkout.addLineItems(checkoutId, lineItems).then(() => {
      assert.ok(false, 'Promise should not resolve');
    }).catch((error) => {
      assert.equal(error.message, '[{"message":"Variant is invalid","field":["lineItems","0","variantId"],"code":"INVALID"}]');
    });
  });

  test('it resolves with a checkout on Client.checkout#replaceLineItems', () => {
    const checkoutId = checkoutLineItemsReplaceFixture.data.checkoutLineItemsReplace.checkout.id;
    const lineItems = [
      {variantId: 'id1', quantity: 5},
      {variantId: 'id2', quantity: 2}
    ];

    fetchMockPostOnce(fetchMock, apiUrl, checkoutLineItemsReplaceFixture);

    return client.checkout.replaceLineItems(checkoutId, lineItems).then((checkout) => {
      assert.equal(checkout.id, checkoutId);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolve with user errors on Client.checkout#replaceLineItems when variant is invalid', () => {
    const checkoutId = checkoutLineItemsReplaceFixture.data.checkoutLineItemsReplace.checkout.id;
    const lineItems = [
      {variantId: '', quantity: 1}
    ];

    fetchMockPostOnce(fetchMock, apiUrl, checkoutLineItemsReplaceWithUserErrorsFixture);

    return client.checkout.replaceLineItems(checkoutId, lineItems).then(() => {
      assert.ok(false, 'Promise should not resolve');
    }).catch((error) => {
      assert.equal(error.message, '[{"message":"Variant is invalid","field":["lineItems","0","variantId"],"code":"INVALID"}]');
    });
  });

  test('it resolves with a checkout on Client.checkout#updateLineItems', () => {
    const checkoutId = checkoutLineItemsUpdateFixture.data.checkoutLineItemsUpdate.checkout.id;
    const lineItems = [
      {
        id: 'id1',
        quantity: 2,
        variantId: 'variant-id'
      }
    ];

    fetchMockPostOnce(fetchMock, apiUrl, checkoutLineItemsUpdateFixture);

    return client.checkout.updateLineItems(checkoutId, lineItems).then((checkout) => {
      assert.equal(checkout.id, checkoutId);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with user errors on Client.checkout#updateLineItems when variant is invalid', () => {
    const checkoutId = checkoutLineItemsUpdateFixture.data.checkoutLineItemsUpdate.checkout.id;
    const lineItems = [
      {
        id: 'id1',
        quantity: 2,
        variantId: ''
      }
    ];

    fetchMockPostOnce(fetchMock, apiUrl, checkoutLineItemsUpdateWithUserErrorsFixture);

    return client.checkout.updateLineItems(checkoutId, lineItems).then(() => {
      assert.ok(false, 'Promise should not resolve');
    }).catch((error) => {
      assert.equal(error.message, '[{"message":"Variant is invalid","field":["lineItems","0","variantId"],"code":"INVALID"}]');
    });
  });

  test('it resolves with a checkout on Client.checkout#removeLineItems', () => {
    const checkoutId = checkoutLineItemsRemoveFixture.data.checkoutLineItemsRemove.checkout.id;

    fetchMockPostOnce(fetchMock, apiUrl, checkoutLineItemsRemoveFixture);

    return client.checkout.removeLineItems(checkoutId, ['line-item-id']).then((checkout) => {
      assert.equal(checkout.id, checkoutId);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with user errors on Client.checkout#removeLineItems when line item is invalid', () => {
    const checkoutId = checkoutLineItemsRemoveFixture.data.checkoutLineItemsRemove.checkout.id;

    fetchMockPostOnce(fetchMock, apiUrl, checkoutLineItemsRemoveWithUserErrorsFixture);

    return client.checkout.removeLineItems(checkoutId, ['invalid-line-item-id']).then(() => {
      assert.ok(false, 'Promise should not resolve');
    }).catch((error) => {
      assert.equal(error.message, '[{"message":"Line item with id abcdefgh not found","field":null,"code":"LINE_ITEM_NOT_FOUND"}]');
    });
  });

  test('it resolves with a checkout on Client.checkout#addDiscount', () => {
    const checkoutId = checkoutDiscountCodeApplyV2Fixture.data.checkoutDiscountCodeApplyV2.checkout.id;
    const discountCode = 'TENPERCENTOFF';

    fetchMockPostOnce(fetchMock, apiUrl, checkoutDiscountCodeApplyV2Fixture);

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

    fetchMockPostOnce(fetchMock, apiUrl, checkoutDiscountCodeApplyV2WithCheckoutUserErrorsFixture);

    const checkoutId = checkoutDiscountCodeApplyV2Fixture.data.checkoutDiscountCodeApplyV2.checkout.id;
    const discountCode = 'INVALIDCODE';

    return client.checkout.addDiscount(checkoutId, discountCode).then(() => {
      assert.ok(false, 'Promise should not resolve');
    }).catch((error) => {
      assert.equal(error.message, '[{"message":"Discount code Unable to find a valid discount matching the code entered","field":["discountCode"],"code":"DISCOUNT_NOT_FOUND"}]');
    });
  });

  test('it resolves with a checkout on Client.checkout#removeDiscount', () => {
    const checkoutId = checkoutDiscountCodeRemoveFixture.data.checkoutDiscountCodeRemove.checkout.id;

    fetchMockPostOnce(fetchMock, apiUrl, checkoutDiscountCodeRemoveFixture);

    return client.checkout.removeDiscount(checkoutId).then((checkout) => {
      assert.equal(checkout.id, checkoutId);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with a checkout on Client.checkout#addGiftCards', () => {
    const checkoutId = checkoutGiftCardsAppendFixture.data.checkoutGiftCardsAppend.checkout.id;
    const giftCardCodes = ['H8HA 6H9F HBA8 F2FC', '6FD8 835D AAGA 949F'];

    fetchMockPostOnce(fetchMock, apiUrl, checkoutGiftCardsAppendFixture);

    return client.checkout.addGiftCards(checkoutId, giftCardCodes).then((checkout) => {
      assert.equal(checkout.id, checkoutId);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with checkoutUserErrors on Client.checkout#addGiftCards with an invalid code', () => {
    const checkoutGiftCardsApppendWithCheckoutUserErrorsFixture = {
      data: {
        checkoutGiftCardsAppend: {
          checkoutUserErrors: [
            {
              message: 'Code is invalid',
              field: ['giftCardCodes', '0'],
              code: 'GIFT_CARD_CODE_INVALID'
            }
          ],
          userErrors: [
            {
              message: 'Code is invalid',
              field: ['giftCardCodes', '0']
            }
          ],
          checkout: null
        }
      }
    };

    fetchMockPostOnce(fetchMock, apiUrl, checkoutGiftCardsApppendWithCheckoutUserErrorsFixture);

    const checkoutId = checkoutGiftCardsAppendFixture.data.checkoutGiftCardsAppend.checkout.id;
    const giftCardCode = 'INVALIDCODE';

    return client.checkout.addGiftCards(checkoutId, [giftCardCode]).then(() => {
      assert.ok(false, 'Promise should not resolve');
    }).catch((error) => {
      assert.equal(error.message, '[{"message":"Code is invalid","field":["giftCardCodes","0"],"code":"GIFT_CARD_CODE_INVALID"}]');
    });
  });

  test('it resolves with a checkout on Client.checkout#removeGiftCard', () => {
    const checkoutId = checkoutGiftCardRemoveV2Fixture.data.checkoutGiftCardRemoveV2.checkout.id;
    const appliedGiftCardId = 'Z2lkOi8vc2hvcGlmeS9BcHBsaWVkR2lmdENhcmQvNDI4NTQ1ODAzMTI=';

    fetchMockPostOnce(fetchMock, apiUrl, checkoutGiftCardRemoveV2Fixture);

    return client.checkout.removeGiftCard(checkoutId, appliedGiftCardId).then((checkout) => {
      assert.equal(checkout.id, checkoutId);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with checkoutUserErrors on Client.checkout#removeGiftCard with a code not present', () => {
    const checkoutGiftCardsRemoveV2WithCheckoutUserErrorsFixture = {
      data: {
        checkoutGiftCardRemoveV2: {
          checkoutUserErrors: [
            {
              message: 'Applied Gift Card not found',
              field: null,
              code: 'GIFT_CARD_NOT_FOUND'
            }
          ],
          userErrors: [
            {
              message: 'Applied Gift Card not found',
              field: null
            }
          ],
          checkout: null
        }
      }
    };

    fetchMockPostOnce(fetchMock, apiUrl, checkoutGiftCardsRemoveV2WithCheckoutUserErrorsFixture);

    const checkoutId = checkoutGiftCardRemoveV2Fixture.data.checkoutGiftCardRemoveV2.checkout.id;
    const appliedGiftCardId = 'Z2lkOi8vc2hvcGlmeS9BcHBsaWVkR2lmdENhcmQvNDI4NTQ1ODAzMTI=';

    return client.checkout.removeGiftCard(checkoutId, appliedGiftCardId).then(() => {
      assert.ok(false, 'Promise should not resolve');
    }).catch((error) => {
      assert.equal(error.message, '[{"message":"Applied Gift Card not found","field":null,"code":"GIFT_CARD_NOT_FOUND"}]');
    });
  });

  test('it resolves with a checkout on Client.checkout#updateShippingAddress', () => {
    const {id: checkoutId} = checkoutShippingAddressUpdateV2Fixture.data.checkoutShippingAddressUpdateV2.checkout;
    const {
      name: shippingName,
      provinceCode: shippingProvince,
      countryCode: shippingCountry
    } = checkoutShippingAddressUpdateV2Fixture.data.checkoutShippingAddressUpdateV2.checkout.shippingAddress;

    fetchMockPostOnce(fetchMock, apiUrl, checkoutShippingAddressUpdateV2Fixture);

    return client.checkout.updateShippingAddress(checkoutId, shippingAddress).then((checkout) => {
      assert.equal(checkout.id, checkoutId);
      assert.equal(checkout.shippingAddress.name, shippingName);
      assert.equal(checkout.shippingAddress.provinceCode, shippingProvince);
      assert.equal(checkout.shippingAddress.countryCode, shippingCountry);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with user errors on Client.checkout#updateShippingAddress with invalid address', () => {
    const checkoutId = checkoutShippingAddressUpdateV2Fixture.data.checkoutShippingAddressUpdateV2.checkout.id;

    fetchMockPostOnce(fetchMock, apiUrl, checkoutShippingAdddressUpdateV2WithUserErrorsFixture);

    return client.checkout.updateShippingAddress(checkoutId, shippingAddress).then(() => {
      assert.ok(false, 'Promise should not resolve.');
    }).catch((error) => {
      assert.equal(error.message, '[{"message":"Country is not supported","field":["shippingAddress","country"],"code":"NOT_SUPPORTED"}]');
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

    fetchMockPostOnce(fetchMock, apiUrl, checkoutCreateWithPaginatedLineItemsFixture);
    fetchMockPostOnce(fetchMock, apiUrl, secondPageLineItemsFixture);
    fetchMockPostOnce(fetchMock, apiUrl, thirdPageLineItemsFixture);

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

    fetchMockPostOnce(fetchMock, apiUrl, checkoutCreateWithUserErrorsFixture);

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

    fetchMockPostOnce(fetchMock, apiUrl, checkoutCreateWithUserErrorsFixture);

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

    fetchMockPostOnce(fetchMock, apiUrl, checkoutCreateWithPaginatedLineItemsFixture);
    fetchMockPostOnce(fetchMock, apiUrl, secondPageLineItemsFixture);
    fetchMockPostOnce(fetchMock, apiUrl, thirdPageLineItemsFixture);

    return client.checkout.create(input).then((checkout) => {
      assert.ok(checkout.errors);
      assert.ok(fetchMock.done());
    }).catch(() => {
      assert.equal(false, 'Should resolve');
    });
  });
});
