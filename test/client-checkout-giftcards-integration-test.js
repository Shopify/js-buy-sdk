import assert from 'assert';
import Client from '../src/client';

suite('client-checkout-giftcards-integration-test', () => {
  const domain = 'graphql.myshopify.com';

  const config = {
    storefrontAccessToken: '595005d0c565f6969eece280de85edb5',
    domain,
    apiVersion: '2025-01'
  };
  let client;

  setup(() => {
    client = Client.buildClient(config);
  });

  teardown(() => {
    client = null;
  });

  suite('addGiftCards', () => {
    test('it adds a single gift card to an empty checkout', () => {
      const input = {
        giftCardCodes: ['100offgiftcard']
      };

      return client.checkout.create({}).then((checkout) => {
        return client.checkout.addGiftCards(checkout.id, input.giftCardCodes).then((updatedCheckout) => {
          assert.strictEqual(updatedCheckout.appliedGiftCards.length, 1);
          assert.strictEqual(updatedCheckout.appliedGiftCards[0].amountUsed.amount, '0.0');
          assert.strictEqual(updatedCheckout.appliedGiftCards[0].amountUsed.currencyCode, 'CAD');
          assert.strictEqual(updatedCheckout.appliedGiftCards[0].amountUsedV2.amount, '0.0');
          assert.strictEqual(updatedCheckout.appliedGiftCards[0].amountUsedV2.currencyCode, 'CAD');
          assert.strictEqual(updatedCheckout.appliedGiftCards[0].balance.amount, '100.0');
          assert.strictEqual(updatedCheckout.appliedGiftCards[0].balance.currencyCode, 'CAD');
          assert.strictEqual(updatedCheckout.appliedGiftCards[0].balanceV2.amount, '100.0');
          assert.strictEqual(updatedCheckout.appliedGiftCards[0].balanceV2.currencyCode, 'CAD');
          assert.strictEqual(updatedCheckout.appliedGiftCards[0].presentmentAmountUsed.amount, '0.0');
          assert.strictEqual(updatedCheckout.appliedGiftCards[0].presentmentAmountUsed.currencyCode, 'CAD');
          assert.ok(updatedCheckout.appliedGiftCards[0].id);
          assert.strictEqual(updatedCheckout.appliedGiftCards[0].lastCharacters, 'card');
          assert.ok(updatedCheckout.appliedGiftCards[0].type);
        });
      });
    });
  });

  test('it adds multiple gift cards to an empty checkout', () => {
    const input = {
      giftCardCodes: ['100offgiftcard', '50offgiftcard']
    };

    return client.checkout.create({}).then((checkout) => {
      return client.checkout.addGiftCards(checkout.id, input.giftCardCodes).then((updatedCheckout) => {
        assert.strictEqual(updatedCheckout.appliedGiftCards.length, 2);

          // first gift card
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].amountUsed.amount, '0.0');
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].amountUsed.currencyCode, 'CAD');
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].amountUsedV2.amount, '0.0');
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].amountUsedV2.currencyCode, 'CAD');
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].balance.amount, '100.0');
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].balance.currencyCode, 'CAD');
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].balanceV2.amount, '100.0');
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].balanceV2.currencyCode, 'CAD');
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].presentmentAmountUsed.amount, '0.0');
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].presentmentAmountUsed.currencyCode, 'CAD');
        assert.ok(updatedCheckout.appliedGiftCards[0].id);
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].lastCharacters, 'card');
        assert.ok(updatedCheckout.appliedGiftCards[0].type);

          // second gift card
        assert.strictEqual(updatedCheckout.appliedGiftCards[1].balance.amount, '50.0');
        assert.strictEqual(updatedCheckout.appliedGiftCards[1].balance.currencyCode, 'CAD');
        assert.ok(updatedCheckout.appliedGiftCards[1].id);
        assert.strictEqual(updatedCheckout.appliedGiftCards[1].lastCharacters, 'card');
        assert.ok(updatedCheckout.appliedGiftCards[1].type);
      });
    });
  });

  test('it adds a single gift card to a checkout with a single line item', () => {
    const createInput = {
      lineItems: [
        {
          variantId: 'gid://shopify/ProductVariant/50850336211000',
          quantity: 1
        }
      ]
    };
    const giftCardCodes = ['100offgiftcard'];

    return client.checkout.create(createInput).then((checkout) => {
      return client.checkout.addGiftCards(checkout.id, giftCardCodes).then((updatedCheckout) => {
        assert.strictEqual(updatedCheckout.appliedGiftCards.length, giftCardCodes.length);
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].amountUsed.amount, '70.0');
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].amountUsed.currencyCode, 'CAD');
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].amountUsedV2.amount, '70.0');
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].amountUsedV2.currencyCode, 'CAD');
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].balance.amount, '30.0');
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].balance.currencyCode, 'CAD');
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].balanceV2.amount, '30.0');
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].balanceV2.currencyCode, 'CAD');
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].presentmentAmountUsed.amount, '70.0');
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].presentmentAmountUsed.currencyCode, 'CAD');
        assert.ok(updatedCheckout.appliedGiftCards[0].id);
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].lastCharacters, 'card');
        assert.ok(updatedCheckout.appliedGiftCards[0].type);

        assert.deepEqual(updatedCheckout.paymentDue, {
          amount: '0.0',
          currencyCode: 'CAD',
          type: {
            name: 'MoneyV2',
            kind: 'OBJECT',
            fieldBaseTypes: {
              amount: 'Decimal',
              currencyCode: 'CurrencyCode'
            },
            implementsNode: false
          }
        });

        assert.ok(updatedCheckout.lineItemsSubtotalPrice, 'lineItemsSubtotalPrice exists');
        assert.strictEqual(updatedCheckout.lineItemsSubtotalPrice.amount, '70.0', 'lineItemsSubtotalPrice amount is correct');
        assert.strictEqual(updatedCheckout.lineItemsSubtotalPrice.currencyCode, 'CAD', 'lineItemsSubtotalPrice currencyCode is correct');

        assert.ok(updatedCheckout.subtotalPrice, 'subtotalPrice exists');
        assert.ok(updatedCheckout.subtotalPriceV2, 'subtotalPriceV2 exists');
        assert.strictEqual(updatedCheckout.subtotalPrice, updatedCheckout.subtotalPriceV2);
        assert.strictEqual(updatedCheckout.subtotalPrice.amount, '70.0', 'subtotalPrice does not include gift cards');
        assert.strictEqual(updatedCheckout.subtotalPrice.currencyCode, 'CAD', 'subtotalPrice currency is correct');

        assert.ok(updatedCheckout.totalPrice, 'totalPrice exists');
        assert.ok(updatedCheckout.totalPriceV2, 'totalPriceV2 exists');
        assert.strictEqual(updatedCheckout.totalPrice, updatedCheckout.totalPriceV2);
        assert.strictEqual(updatedCheckout.totalPrice.amount, '70.0', 'totalPrice does not include gift cards');
        assert.strictEqual(updatedCheckout.totalPrice.currencyCode, 'CAD', 'totalPrice currency is correct');

        assert.ok(updatedCheckout.totalTax, 'totalTax exists');
        assert.ok(updatedCheckout.totalTaxV2, 'totalTaxV2 exists');

        assert.ok(updatedCheckout.paymentDue, 'paymentDue exists');
        assert.ok(updatedCheckout.paymentDueV2, 'paymentDueV2 exists');
        assert.strictEqual(updatedCheckout.paymentDue, updatedCheckout.paymentDueV2);
        assert.strictEqual(updatedCheckout.paymentDue.amount, '0.0', 'paymentDue amount includes gift cards');
        assert.strictEqual(updatedCheckout.paymentDue.currencyCode, 'CAD', 'paymentDue currencyCode is correct');

        // Verify UNSUPPORTED_FIELDS maintain expected values
        assert.strictEqual(updatedCheckout.completedAt, null, 'completedAt is null');
        assert.strictEqual(updatedCheckout.order, null, 'order is null');
        assert.strictEqual(updatedCheckout.orderStatusUrl, null, 'orderStatusUrl is null');
        assert.strictEqual(updatedCheckout.ready, false, 'ready is false');
        assert.strictEqual(updatedCheckout.requiresShipping, true, 'requiresShipping is true');
        assert.strictEqual(updatedCheckout.shippingLine, null, 'shippingLine is null');
        assert.strictEqual(updatedCheckout.taxExempt, false, 'taxExempt is false');
        assert.strictEqual(updatedCheckout.taxesIncluded, false, 'taxesIncluded is false');
      });
    });
  });

  test('it adds multiple gift cards to a checkout with a multiple line items', () => {
    const createInput = {
      lineItems: [
        {
          variantId: 'gid://shopify/ProductVariant/50850334310456',
          quantity: 1
        },
        {
          variantId: 'gid://shopify/ProductVariant/50850336211000',
          quantity: 1
        }
      ]
    };
    const giftCardCodes = ['100offgiftcard', '50offgiftcard'];

    return client.checkout.create(createInput).then((checkout) => {
      return client.checkout.addGiftCards(checkout.id, giftCardCodes).then((updatedCheckout) => {
        assert.strictEqual(updatedCheckout.appliedGiftCards.length, 2);

          // first gift card
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].amountUsed.amount, '100.0');
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].amountUsed.currencyCode, 'CAD');
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].amountUsedV2.amount, '100.0');
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].amountUsedV2.currencyCode, 'CAD');
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].balance.amount, '0.0');
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].balance.currencyCode, 'CAD');
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].balanceV2.amount, '0.0');
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].balanceV2.currencyCode, 'CAD');
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].presentmentAmountUsed.amount, '100.0');
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].presentmentAmountUsed.currencyCode, 'CAD');
        assert.ok(updatedCheckout.appliedGiftCards[0].id);
        assert.strictEqual(updatedCheckout.appliedGiftCards[0].lastCharacters, 'card');
        assert.ok(updatedCheckout.appliedGiftCards[0].type);

          // second gift card
        assert.strictEqual(updatedCheckout.appliedGiftCards[1].balance.amount, '0.0');
        assert.strictEqual(updatedCheckout.appliedGiftCards[1].balance.currencyCode, 'CAD');
        assert.ok(updatedCheckout.appliedGiftCards[1].id);
        assert.strictEqual(updatedCheckout.appliedGiftCards[1].lastCharacters, 'card');
        assert.ok(updatedCheckout.appliedGiftCards[1].type);


        assert.ok(updatedCheckout.lineItemsSubtotalPrice, 'lineItemsSubtotalPrice exists');
        assert.strictEqual(updatedCheckout.lineItemsSubtotalPrice.amount, '270.0', 'lineItemsSubtotalPrice does not include gift cards');
        assert.strictEqual(updatedCheckout.lineItemsSubtotalPrice.currencyCode, 'CAD', 'lineItemsSubtotalPrice currencyCode is correct');

        assert.ok(updatedCheckout.subtotalPrice, 'subtotalPrice exists');
        assert.ok(updatedCheckout.subtotalPriceV2, 'subtotalPriceV2 exists');
        assert.strictEqual(updatedCheckout.subtotalPrice, updatedCheckout.subtotalPriceV2);
        assert.strictEqual(updatedCheckout.subtotalPrice.amount, '270.0', 'subtotalPrice does not include gift cards');
        assert.strictEqual(updatedCheckout.subtotalPrice.currencyCode, 'CAD', 'subtotalPrice currency is correct');

        assert.ok(updatedCheckout.totalPrice, 'totalPrice exists');
        assert.ok(updatedCheckout.totalPriceV2, 'totalPriceV2 exists');
        assert.strictEqual(updatedCheckout.totalPrice, updatedCheckout.totalPriceV2);
        assert.strictEqual(updatedCheckout.totalPrice.amount, '270.0', 'totalPrice does not include gift cards');
        assert.strictEqual(updatedCheckout.totalPrice.currencyCode, 'CAD', 'totalPrice currency is correct');

        assert.ok(updatedCheckout.paymentDue, 'paymentDue exists');
        assert.ok(updatedCheckout.paymentDueV2, 'paymentDueV2 exists');
        assert.strictEqual(updatedCheckout.paymentDue, updatedCheckout.paymentDueV2);
        assert.strictEqual(updatedCheckout.paymentDue.amount, '120.0', 'paymentDue amount includes gift cards');
        assert.strictEqual(updatedCheckout.paymentDue.currencyCode, 'CAD', 'paymentDue currencyCode is correct');

        assert.ok(updatedCheckout.totalTax, 'totalTax exists');
        assert.ok(updatedCheckout.totalTaxV2, 'totalTaxV2 exists');
      });
    });
  });

  suite('removeGiftCard', () => {
    test('it removes a single gift card from an empty checkout', () => {
      const input = {
        giftCardCodes: ['100offgiftcard']
      };

      return client.checkout.create({}).then((checkout) => {
        return client.checkout.addGiftCards(checkout.id, input.giftCardCodes).then((updatedCheckout) => {
          return client.checkout.removeGiftCard(updatedCheckout.id, updatedCheckout.appliedGiftCards[0].id).then((updatedCheckoutTwo) => {
            assert.strictEqual(updatedCheckoutTwo.appliedGiftCards.length, 0);
          });
        });
      });
    }).timeout(5000);

    test('it removes a single gift card from a checkout with a single line item', () => {
      const createInput = {
        lineItems: [
          {
            variantId: 'gid://shopify/ProductVariant/50850336211000',
            quantity: 1
          }
        ]
      };
      const giftCardCodes = ['100offgiftcard'];

      return client.checkout.create(createInput).then((checkout) => {
        return client.checkout.addGiftCards(checkout.id, giftCardCodes).then((updatedCheckout) => {
          return client.checkout.removeGiftCard(updatedCheckout.id, updatedCheckout.appliedGiftCards[0].id).then((updatedCheckoutTwo) => {
            assert.strictEqual(updatedCheckoutTwo.appliedGiftCards.length, 0);
          });
        });
      });
    });
  });
});
