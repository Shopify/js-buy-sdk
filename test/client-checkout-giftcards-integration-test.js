import assert from 'assert';
import Client from '../src/client';

suite('client-checkout-giftcards-integration-test', () => {
  const domain = 'graphql.myshopify.com';

  const config = {
    storefrontAccessToken: '595005d0c565f6969eece280de85edb5',
    domain,
    apiVersion: 'unstable'
  };
  let client;
  let apiUrl;

  setup(() => {
    client = Client.buildClient(config);
    apiUrl = `https://${domain}/api/unstable/graphql`;
  });

  teardown(() => {
    client = null;
  });

  suite('addGiftCards', () => {
    suite('empty checkout', () => {
      test('it adds a single gift card to an empty checkout', () => {
        const input = {
          giftCardCodes: ['100offgiftcard']
        };

        return client.checkout.create({}).then((checkout) => {
          return client.checkout.addGiftCards(checkout.id, input.giftCardCodes).then((updatedCheckout) => {
            assert.equal(updatedCheckout.appliedGiftCards.length, 1);
            assert.deepEqual(updatedCheckout.appliedGiftCards[0], {
              amountUsed: {
                amount: '0.0',
                currencyCode: 'CAD'
              },
              amountUsedV2: {
                amount: '0.0',
                currencyCode: 'CAD'
              },
              balance: {
                amount: '100.0',
                currencyCode: 'CAD'
              },
              balanceV2: {
                amount: '100.0',
                currencyCode: 'CAD'
              },
              presentmentAmountUsed: {
                amount: '0.0',
                currencyCode: 'CAD'
              },
              id: 'gid://shopify/AppliedGiftCard/639934201912',
              lastCharacters: 'card'
            });
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
          assert.equal(updatedCheckout.appliedGiftCards.length, 2);
          assert.deepEqual(updatedCheckout.appliedGiftCards[0], {
            amountUsed: {
              amount: '0.0',
              currencyCode: 'CAD'
            },
            amountUsedV2: {
              amount: '0.0',
              currencyCode: 'CAD'
            },
            balance: {
              amount: '100.0',
              currencyCode: 'CAD'
            },
            balanceV2: {
              amount: '100.0',
              currencyCode: 'CAD'
            },
            presentmentAmountUsed: {
              amount: '0.0',
              currencyCode: 'CAD'
            },
            id: 'gid://shopify/AppliedGiftCard/639934201912',
            lastCharacters: 'card'
          });

          assert.equal(updatedCheckout.appliedGiftCards[1], {
            amountUsed: {
              amount: '0.0',
              currencyCode: 'CAD'
            },
            amountUsedV2: {
              amount: '0.0',
              currencyCode: 'CAD'
            },
            balance: {
              amount: '50.0',
              currencyCode: 'CAD'
            },
            balanceV2: {
              amount: '50.0',
              currencyCode: 'CAD'
            },
            presentmentAmountUsed: {
              amount: '0.0',
              currencyCode: 'CAD'
            },
            id: 'gid://shopify/AppliedGiftCard/639934234680',
            lastCharacters: 'card'
          });
        });
      });
    });

    test('it adds a single gift card to a checkout with a single line item', () => {
      const input = {
        giftCardCodes: ['100offgiftcard']
      };

      return client.checkout.create({}).then((checkout) => {
        return client.checkout.addGiftCards(checkout.id, input.giftCardCodes).then((updatedCheckout) => {
          assert.equal(updatedCheckout.appliedGiftCards.length, input.giftCardCodes.length);

          assert.deepEqual(updatedCheckout.appliedGiftCards[0], {
            amountUsed: {
              amount: '100.0',
              currencyCode: 'CAD'
            },
            amountUsedV2: {
              amount: '100.0',
              currencyCode: 'CAD'
            },
            balance: {
              amount: '100.0',
              currencyCode: 'CAD'
            },
            balanceV2: {
              amount: '100.0',
              currencyCode: 'CAD'
            },
            presentmentAmountUsed: {
              amount: '100.0',
              currencyCode: 'CAD'
            },
            id: 'gid://shopify/AppliedGiftCard/639934201912',
            lastCharacters: 'card'
          });

          assert.deepEqual(updatedCheckout.paymentDue, {
            amount: '100.0',
            currencyCode: 'CAD'
          });

          assert.deepEqual(updatedCheckout.totalTax, {
            amount: '0.0',
            currencyCode: 'CAD'
          });

          assert.deepEqual(updatedCheckout.lineItemsSubtotalPrice, {
            amount: '200.0',
            currencyCode: 'CAD'
          });

          assert.deepEqual(updatedCheckout.subtotalPrice, {
            amount: '200.0',
            currencyCode: 'CAD'
          });

          assert.deepEqual(updatedCheckout.totalPrice, {
            amount: '200.0',
            currencyCode: 'CAD'
          });
        });
      });
    });

    test('it adds multiple gift cards to a checkout with a multiple line items', () => {
      const input = {
        giftCardCodes: ['100offgiftcard', '50offgiftcard']
      };

      return client.checkout.create({}).then((checkout) => {
        return client.checkout.addGiftCards(checkout.id, input.giftCardCodes).then((updatedCheckout) => {
          assert.equal(updatedCheckout.appliedGiftCards.length, input.giftCardCodes.length);

          assert.deepEqual(updatedCheckout.appliedGiftCards[0], {
            amountUsed: {
              amount: '100.0',
              currencyCode: 'CAD'
            },
            amountUsedV2: {
              amount: '100.0',
              currencyCode: 'CAD'
            },
            balance: {
              amount: '100.0',
              currencyCode: 'CAD'
            },
            balanceV2: {
              amount: '100.0',
              currencyCode: 'CAD'
            },
            presentmentAmountUsed: {
              amount: '100.0',
              currencyCode: 'CAD'
            },
            id: 'gid://shopify/AppliedGiftCard/639934201912',
            lastCharacters: 'card'
          });


          assert.deepEqual(updatedCheckout.appliedGiftCards[1], {
            amountUsed: {
              amount: '50.0',
              currencyCode: 'CAD'
            },
            amountUsedV2: {
              amount: '50.0',
              currencyCode: 'CAD'
            },
            balance: {
              amount: '50.0',
              currencyCode: 'CAD'
            },
            balanceV2: {
              amount: '50.0',
              currencyCode: 'CAD'
            },
            presentmentAmountUsed: {
              amount: '50.0',
              currencyCode: 'CAD'
            },
            id: 'gid://shopify/AppliedGiftCard/639934234680',
            lastCharacters: 'card'
          });

          assert.deepEqual(updatedCheckout.paymentDue, {
            amount: '120.0',
            currencyCode: 'CAD'
          });

          assert.deepEqual(updatedCheckout.totalTax, {
            amount: '0.0',
            currencyCode: 'CAD'
          });

          assert.deepEqual(updatedCheckout.lineItemsSubtotalPrice, {
            amount: '270.0',
            currencyCode: 'CAD'
          });

          assert.deepEqual(updatedCheckout.subtotalPrice, {
            amount: '270.0',
            currencyCode: 'CAD'
          });

          assert.deepEqual(updatedCheckout.totalPrice, {
            amount: '220.0',
            currencyCode: 'CAD'
          });

          assert.deepEqual(updatedCheckout.totalPriceV2, {
            amount: '220.0',
            currencyCode: 'CAD'
          });

          assert.deepEqual(updatedCheckout.subtotalPriceV2, {
            amount: '220.0',
            currencyCode: 'CAD'
          });

          assert.deepEqual(updatedCheckout.lineItemsSubtotalPrice, {
            amount: '270.0',
            currencyCode: 'CAD'
          });

          assert.deepEqual(updatedCheckout.subtotalPrice, {
            amount: '270.0',
            currencyCode: 'CAD'
          });

          assert.deepEqual(updatedCheckout.totalPrice, {
            amount: '220.0',
            currencyCode: 'CAD'
          });

          assert.deepEqual(updatedCheckout.totalPriceV2, {
            amount: '220.0',
            currencyCode: 'CAD'
          });

        });
      });
    });
  });
});
