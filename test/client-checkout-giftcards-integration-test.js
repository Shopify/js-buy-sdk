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
            assert.equal(updatedCheckout.appliedGiftCards[0].amountUsed.amount, '0.0');
            assert.equal(updatedCheckout.appliedGiftCards[0].amountUsed.currencyCode, 'XXX');
            assert.equal(updatedCheckout.appliedGiftCards[0].amountUsedV2.amount, '0.0');
            assert.equal(updatedCheckout.appliedGiftCards[0].amountUsedV2.currencyCode, 'XXX');
            assert.equal(updatedCheckout.appliedGiftCards[0].balance.amount, '100.0');
            assert.equal(updatedCheckout.appliedGiftCards[0].balance.currencyCode, 'CAD');
            assert.equal(updatedCheckout.appliedGiftCards[0].balanceV2.amount, '100.0');
            assert.equal(updatedCheckout.appliedGiftCards[0].balanceV2.currencyCode, 'CAD');
            assert.equal(updatedCheckout.appliedGiftCards[0].presentmentAmountUsed.amount, '0.0');
            assert.equal(updatedCheckout.appliedGiftCards[0].presentmentAmountUsed.currencyCode, 'XXX');
            assert.ok(updatedCheckout.appliedGiftCards[0].id);
            assert.equal(updatedCheckout.appliedGiftCards[0].lastCharacters, 'card');
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
          assert.equal(updatedCheckout.appliedGiftCards.length, 2);

          // first gift card
          assert.equal(updatedCheckout.appliedGiftCards[0].amountUsed.amount, '0.0');
          assert.equal(updatedCheckout.appliedGiftCards[0].amountUsed.currencyCode, 'XXX');
          assert.equal(updatedCheckout.appliedGiftCards[0].amountUsedV2.amount, '0.0');
          assert.equal(updatedCheckout.appliedGiftCards[0].amountUsedV2.currencyCode, 'XXX');
          assert.equal(updatedCheckout.appliedGiftCards[0].balance.amount, '100.0');
          assert.equal(updatedCheckout.appliedGiftCards[0].balance.currencyCode, 'CAD');
          assert.equal(updatedCheckout.appliedGiftCards[0].balanceV2.amount, '100.0');
          assert.equal(updatedCheckout.appliedGiftCards[0].balanceV2.currencyCode, 'CAD');
          assert.equal(updatedCheckout.appliedGiftCards[0].presentmentAmountUsed.amount, '0.0');
          assert.equal(updatedCheckout.appliedGiftCards[0].presentmentAmountUsed.currencyCode, 'XXX');
          assert.ok(updatedCheckout.appliedGiftCards[0].id);
          assert.equal(updatedCheckout.appliedGiftCards[0].lastCharacters, 'card');
          assert.ok(updatedCheckout.appliedGiftCards[0].type);

          // second gift card
          assert.equal(updatedCheckout.appliedGiftCards[1].balance.amount, '50.0');
          assert.equal(updatedCheckout.appliedGiftCards[1].balance.currencyCode, 'CAD');
          assert.ok(updatedCheckout.appliedGiftCards[1].id);
          assert.equal(updatedCheckout.appliedGiftCards[1].lastCharacters, 'card');
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
          assert.equal(updatedCheckout.appliedGiftCards.length, giftCardCodes.length);
          assert.equal(updatedCheckout.appliedGiftCards[0].amountUsed.amount, '73.5');
          assert.equal(updatedCheckout.appliedGiftCards[0].amountUsed.currencyCode, 'CAD');
          assert.equal(updatedCheckout.appliedGiftCards[0].amountUsedV2.amount, '73.5');
          assert.equal(updatedCheckout.appliedGiftCards[0].amountUsedV2.currencyCode, 'CAD');
          assert.equal(updatedCheckout.appliedGiftCards[0].balance.amount, '26.5');
          assert.equal(updatedCheckout.appliedGiftCards[0].balance.currencyCode, 'CAD');
          assert.equal(updatedCheckout.appliedGiftCards[0].balanceV2.amount, '26.5');
          assert.equal(updatedCheckout.appliedGiftCards[0].balanceV2.currencyCode, 'CAD');
          assert.equal(updatedCheckout.appliedGiftCards[0].presentmentAmountUsed.amount, '73.5');
          assert.equal(updatedCheckout.appliedGiftCards[0].presentmentAmountUsed.currencyCode, 'CAD');
          assert.ok(updatedCheckout.appliedGiftCards[0].id);
          assert.equal(updatedCheckout.appliedGiftCards[0].lastCharacters, 'card');
          assert.ok(updatedCheckout.appliedGiftCards[0].type);

          assert.deepEqual(updatedCheckout.paymentDue, {
            amount: '-73.5',
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
          assert.equal(updatedCheckout.appliedGiftCards.length, 2);

          // first gift card
          assert.equal(updatedCheckout.appliedGiftCards[0].amountUsed.amount, '100.0');
          assert.equal(updatedCheckout.appliedGiftCards[0].amountUsed.currencyCode, 'CAD');
          assert.equal(updatedCheckout.appliedGiftCards[0].amountUsedV2.amount, '100.0');
          assert.equal(updatedCheckout.appliedGiftCards[0].amountUsedV2.currencyCode, 'CAD');
          assert.equal(updatedCheckout.appliedGiftCards[0].balance.amount, '0.0');
          assert.equal(updatedCheckout.appliedGiftCards[0].balance.currencyCode, 'CAD');
          assert.equal(updatedCheckout.appliedGiftCards[0].balanceV2.amount, '0.0');
          assert.equal(updatedCheckout.appliedGiftCards[0].balanceV2.currencyCode, 'CAD');
          assert.equal(updatedCheckout.appliedGiftCards[0].presentmentAmountUsed.amount, '100.0');
          assert.equal(updatedCheckout.appliedGiftCards[0].presentmentAmountUsed.currencyCode, 'CAD');
          assert.ok(updatedCheckout.appliedGiftCards[0].id);
          assert.equal(updatedCheckout.appliedGiftCards[0].lastCharacters, 'card');
          assert.ok(updatedCheckout.appliedGiftCards[0].type);

          // second gift card
          assert.equal(updatedCheckout.appliedGiftCards[1].balance.amount, '0.0');
          assert.equal(updatedCheckout.appliedGiftCards[1].balance.currencyCode, 'CAD');
          assert.ok(updatedCheckout.appliedGiftCards[1].id);
          assert.equal(updatedCheckout.appliedGiftCards[1].lastCharacters, 'card');
          assert.ok(updatedCheckout.appliedGiftCards[1].type);
        });
      });
    });
  });
});
