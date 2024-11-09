import assert from 'assert';
import Client from '../src/client';

suite('client-checkout-giftcards-integration-test', () => {
  const domain = 'juanprieto.myshopify.com';

  const config = {
    storefrontAccessToken: 'c23ad8269962738dd66dfd85d9b45a2d',
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
                currencyCode: 'USD',
                type: {
                  name: 'MoneyV2',
                  kind: 'OBJECT',
                  fieldBaseTypes: {
                    amount: 'Decimal',
                    currencyCode: 'CurrencyCode'
                  },
                  implementsNode: false
                }
              },
              amountUsedV2: {
                amount: '0.0',
                currencyCode: 'USD',
                type: {
                  name: 'MoneyV2',
                  kind: 'OBJECT',
                  fieldBaseTypes: {
                    amount: 'Decimal',
                    currencyCode: 'CurrencyCode'
                  },
                  implementsNode: false
                }
              },
              balance: {
                amount: '100.0',
                currencyCode: 'USD',
                type: {
                  name: 'MoneyV2',
                  kind: 'OBJECT',
                  fieldBaseTypes: {
                    amount: 'Decimal',
                    currencyCode: 'CurrencyCode'
                  },
                  implementsNode: false
                }
              },
              balanceV2: {
                amount: '100.0',
                currencyCode: 'USD',
                type: {
                  name: 'MoneyV2',
                  kind: 'OBJECT',
                  fieldBaseTypes: {
                    amount: 'Decimal',
                    currencyCode: 'CurrencyCode'
                  },
                  implementsNode: false
                }
              },
              presentmentAmountUsed: {
                amount: '0.0',
                currencyCode: 'USD',
                type: {
                  name: 'MoneyV2',
                  kind: 'OBJECT',
                  fieldBaseTypes: {
                    amount: 'Decimal',
                    currencyCode: 'CurrencyCode'
                  },
                  implementsNode: false
                }
              },
              id: 'gid://shopify/AppliedGiftCard/253346316310',
              lastCharacters: 'card',
              type: {
                name: 'AppliedGiftCard',
                kind: 'OBJECT',
                fieldBaseTypes: {
                  amountUsed: 'MoneyV2',
                  balance: 'MoneyV2',
                  id: 'ID',
                  lastCharacters: 'String',
                  presentmentAmountUsed: 'MoneyV2'
                },
                implementsNode: true
              }
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
              currencyCode: 'USD',
              type: {
                name: 'MoneyV2',
                kind: 'OBJECT',
                fieldBaseTypes: {
                  amount: 'Decimal',
                  currencyCode: 'CurrencyCode'
                },
                implementsNode: false
              }
            },
            amountUsedV2: {
              amount: '0.0',
              currencyCode: 'USD',
              type: {
                name: 'MoneyV2',
                kind: 'OBJECT',
                fieldBaseTypes: {
                  amount: 'Decimal',
                  currencyCode: 'CurrencyCode'
                },
                implementsNode: false
              }
            },
            balance: {
              amount: '100.0',
              currencyCode: 'USD',
              type: {
                name: 'MoneyV2',
                kind: 'OBJECT',
                fieldBaseTypes: {
                  amount: 'Decimal',
                  currencyCode: 'CurrencyCode'
                },
                implementsNode: false
              }
            },
            balanceV2: {
              amount: '100.0',
              currencyCode: 'USD',
              type: {
                name: 'MoneyV2',
                kind: 'OBJECT',
                fieldBaseTypes: {
                  amount: 'Decimal',
                  currencyCode: 'CurrencyCode'
                },
                implementsNode: false
              }
            },
            presentmentAmountUsed: {
              amount: '0.0',
              currencyCode: 'USD',
              type: {
                name: 'MoneyV2',
                kind: 'OBJECT',
                fieldBaseTypes: {
                  amount: 'Decimal',
                  currencyCode: 'CurrencyCode'
                },
                implementsNode: false
              }
            },
            id: 'gid://shopify/AppliedGiftCard/253346349078',
            lastCharacters: 'card',
            type: {
              name: 'AppliedGiftCard',
              kind: 'OBJECT',
              fieldBaseTypes: {
                amountUsed: 'MoneyV2',
                balance: 'MoneyV2',
                id: 'ID',
                lastCharacters: 'String',
                presentmentAmountUsed: 'MoneyV2'
              },
              implementsNode: true
            }
          });

          assert.equal(updatedCheckout.appliedGiftCards[1], {
            amountUsed: {
              amount: '0.0',
              currencyCode: 'USD',
              type: {
                name: 'MoneyV2',
                kind: 'OBJECT',
                fieldBaseTypes: {
                  amount: 'Decimal',
                  currencyCode: 'CurrencyCode'
                },
                implementsNode: false
              }
            },
            amountUsedV2: {
              amount: '0.0',
              currencyCode: 'USD',
              type: {
                name: 'MoneyV2',
                kind: 'OBJECT',
                fieldBaseTypes: {
                  amount: 'Decimal',
                  currencyCode: 'CurrencyCode'
                },
                implementsNode: false
              }
            },
            balance: {
              amount: '50.0',
              currencyCode: 'USD',
              type: {
                name: 'MoneyV2',
                kind: 'OBJECT',
                fieldBaseTypes: {
                  amount: 'Decimal',
                  currencyCode: 'CurrencyCode'
                },
                implementsNode: false
              }
            },
            balanceV2: {
              amount: '50.0',
              currencyCode: 'USD',
              type: {
                name: 'MoneyV2',
                kind: 'OBJECT',
                fieldBaseTypes: {
                  amount: 'Decimal',
                  currencyCode: 'CurrencyCode'
                },
                implementsNode: false
              }
            },
            presentmentAmountUsed: {
              amount: '0.0',
              currencyCode: 'USD',
              type: {
                name: 'MoneyV2',
                kind: 'OBJECT',
                fieldBaseTypes: {
                  amount: 'Decimal',
                  currencyCode: 'CurrencyCode'
                },
                implementsNode: false
              }
            },
            id: 'gid://shopify/AppliedGiftCard/253346381846',
            lastCharacters: 'card',
            type: {
              name: 'AppliedGiftCard',
              kind: 'OBJECT',
              fieldBaseTypes: {
                amountUsed: 'MoneyV2',
                balance: 'MoneyV2',
                id: 'ID',
                lastCharacters: 'String',
                presentmentAmountUsed: 'MoneyV2'
              },
              implementsNode: true
            }
          });
        });
      });
    });

    // TODO: add all other fixtures
  });

  suite(('removeGiftCard'), () => {});
});
