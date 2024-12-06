import assert from 'assert';
import Client from '../src/client';

// NOTE:
// graphql.myshopify.com
// gid://shopify/ProductVariant/50850334310456 Arena Zip Boot SDK
// gid://shopify/ProductVariant/50850336211000 Brace Tonic Crew SDK /48535896555542

suite('client-checkout-discounts-integration-test', () => {
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

  suite('addDiscount', () => {
    suite('empty checkout', () => {
      test('it does not add a fixed amount discount to an empty checkout via addDiscount', () => {
        const discountCode = '10OFF';

        return client.checkout.create({}).then((checkout) => {
          return client.checkout.addDiscount(checkout.id, discountCode).then((updatedCheckout) => {
            assert.equal(updatedCheckout.discountApplications.length, 0);
          });
        });
      });

      test('it does not add a percentage discount to an empty checkout via addDiscount', () => {
        const discountCode = '10PERCENTOFF';

        return client.checkout.create({}).then((checkout) => {
          return client.checkout.addDiscount(checkout.id, discountCode).then((updatedCheckout) => {
            assert.equal(updatedCheckout.discountApplications.length, 0);
          });
        });
      });

    });

    suite('checkout with a single line item', () => {
      test('it adds a fixed amount discount to a checkout with a single line item via addDiscount', () => {

        return client.checkout.create({
          lineItems: [
            {
              variantId: 'gid://shopify/ProductVariant/50850334310456',
              quantity: 1
            }
          ]
        }).then((checkout) => {
          return client.checkout.addDiscount(checkout.id, '10OFF').then((updatedCheckout) => {
            // top-level discountApplication exists
            assert.equal(updatedCheckout.discountApplications.length, 1);

            // top-level discountApplications matches expected structure
            assert.deepEqual(updatedCheckout.discountApplications[0],
              {
                __typename: 'DiscountCodeApplication',
                targetSelection: 'ENTITLED',
                allocationMethod: 'EACH',
                targetType: 'LINE_ITEM',
                value: {
                  amount: '10.0',
                  currencyCode: 'CAD',
                  type: {
                    name: 'PricingValue',
                    kind: 'UNION'
                  }
                },
                code: '10OFF',
                applicable: true,
                type: {
                  name: 'DiscountCodeApplication',
                  kind: 'OBJECT',
                  fieldBaseTypes: {
                    applicable: 'Boolean',
                    code: 'String'
                  },
                  implementsNode: false
                },
                hasNextPage: false,
                hasPreviousPage: false,
                variableValues: {
                  checkoutId: 'gid://shopify/Checkout/e780a1b5bffd6a9ef530f1718b854e4f?key=f06572e061a9cc7e3b73e9a235239f42',
                  discountCode: '10OFF'
                }
              }
            );

            // line item discountAllocation exists
            assert.equal(updatedCheckout.lineItems[0].discountAllocations.length, 1);

            // line item discountAllocation matches expected structure
            assert.equal(updatedCheckout.lineItems[0].discountAllocations[0], {
              allocatedAmount: {
                amount: '10.0',
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
              },
              discountApplication: {
                __typename: 'DiscountCodeApplication',
                targetSelection: 'ENTITLED',
                allocationMethod: 'EACH',
                targetType: 'LINE_ITEM',
                value: {
                  amount: '10.0',
                  currencyCode: 'CAD',
                  type: {
                    name: 'PricingValue',
                    kind: 'UNION'
                  }
                },
                code: '10OFF',
                applicable: true,
                type: {
                  name: 'DiscountCodeApplication',
                  kind: 'OBJECT',
                  fieldBaseTypes: {
                    applicable: 'Boolean',
                    code: 'String'
                  },
                  implementsNode: false
                }
              },
              type: {
                name: 'DiscountAllocation',
                kind: 'OBJECT',
                fieldBaseTypes: {
                  allocatedAmount: 'MoneyV2',
                  discountApplication: 'DiscountApplication'
                },
                implementsNode: false
              }
            }
            );
          });
        });
      });

      test('it adds a percentage discount to a checkout with a single line item via addDiscount', () => {
        const discountCode = '10PERCENTOFF';

        return client.checkout.create({
          lineItems: [
            {
              variantId: 'gid://shopify/ProductVariant/50850334310456',
              quantity: 1
            }
          ]
        }).then((checkout) => {
          return client.checkout.addDiscount(checkout.id, discountCode).then((updatedCheckout) => {
            assert.equal(updatedCheckout.discountApplications.length, 1);
            assert.deepEqual(updatedCheckout.discountApplications[0], {
              __typename: 'DiscountCodeApplication',
              targetSelection: 'ENTITLED',
              allocationMethod: 'EACH',
              targetType: 'LINE_ITEM',
              value: {
                percentage: 10,
                type: {
                  name: 'PricingValue',
                  kind: 'UNION'
                }
              },
              code: '10PERCENTOFF',
              applicable: true,
              type: {
                name: 'DiscountCodeApplication',
                kind: 'OBJECT',
                fieldBaseTypes: {
                  applicable: 'Boolean',
                  code: 'String'
                },
                implementsNode: false
              },
              hasNextPage: false,
              hasPreviousPage: false,
              variableValues: {
                checkoutId: 'gid://shopify/Checkout/8e0b563fe9cbed2f28578774a29b4384?key=05c177374a10f2d633fa055ead3c0a76',
                discountCode: '10PERCENTOFF'
              }
            });
            assert.equal(updatedCheckout.lineItems[0].discountAllocations.length, 1);
            assert.deepEqual(updatedCheckout.lineItems[0].discountAllocations[0], {
              allocatedAmount: {
                amount: '20.0',
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
              },
              discountApplication: {
                __typename: 'DiscountCodeApplication',
                targetSelection: 'ENTITLED',
                allocationMethod: 'EACH',
                targetType: 'LINE_ITEM',
                value: {
                  percentage: 10,
                  type: {
                    name: 'PricingValue',
                    kind: 'UNION'
                  }
                },
                code: '10PERCENTOFF',
                applicable: true,
                type: {
                  name: 'DiscountCodeApplication',
                  kind: 'OBJECT',
                  fieldBaseTypes: {
                    applicable: 'Boolean',
                    code: 'String'
                  },
                  implementsNode: false
                }
              },
              type: {
                name: 'DiscountAllocation',
                kind: 'OBJECT',
                fieldBaseTypes: {
                  allocatedAmount: 'MoneyV2',
                  discountApplication: 'DiscountApplication'
                },
                implementsNode: false
              }
            });
          });
        });
      });

      test('it adds an order-level fixed amount discount to a checkout with a single line item via addDiscount', () => {
        const discountCode = 'ORDERFIXED50OFF';

        return client.checkout.create({
          lineItems: [
            {
              variantId: 'gid://shopify/ProductVariant/50850334310456',
              quantity: 1
            }
          ]
        }).then((checkout) => {
          return client.checkout.addDiscount(checkout.id, discountCode).then((updatedCheckout) => {
            assert.equal(updatedCheckout.discountApplications.length, 1);
            assert.deepEqual(updatedCheckout.discountApplications[0], {
              __typename: 'DiscountCodeApplication',
              targetSelection: 'ALL',
              allocationMethod: 'ACROSS',
              targetType: 'LINE_ITEM',
              value: {
                amount: '50.0',
                currencyCode: 'CAD',
                type: {
                  name: 'PricingValue',
                  kind: 'UNION'
                }
              },
              code: 'ORDERFIXED50OFF',
              applicable: true,
              type: {
                name: 'DiscountCodeApplication',
                kind: 'OBJECT',
                fieldBaseTypes: {
                  applicable: 'Boolean',
                  code: 'String'
                },
                implementsNode: false
              },
              hasNextPage: false,
              hasPreviousPage: false,
              variableValues: {
                checkoutId: 'gid://shopify/Checkout/0781db3a69dfb04f7b35ba3d5d284ec3?key=a48ed68f7ed154809d2aedc8ae579647',
                discountCode: 'ORDERFIXED50OFF'
              }
            });
            assert.equal(updatedCheckout.lineItems[0].discountAllocations.length, 1);
            assert.equal(updatedCheckout.lineItems[0].discountAllocations[0], {
              allocatedAmount: {
                amount: '50.0',
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
              },
              discountApplication: {
                __typename: 'DiscountCodeApplication',
                targetSelection: 'ALL',
                allocationMethod: 'ACROSS',
                targetType: 'LINE_ITEM',
                value: {
                  amount: '50.0',
                  currencyCode: 'CAD',
                  type: {
                    name: 'PricingValue',
                    kind: 'UNION'
                  }
                },
                code: 'ORDERFIXED50OFF',
                applicable: true,
                type: {
                  name: 'DiscountCodeApplication',
                  kind: 'OBJECT',
                  fieldBaseTypes: {
                    applicable: 'Boolean',
                    code: 'String'
                  },
                  implementsNode: false
                }
              },
              type: {
                name: 'DiscountAllocation',
                kind: 'OBJECT',
                fieldBaseTypes: {
                  allocatedAmount: 'MoneyV2',
                  discountApplication: 'DiscountApplication'
                },
                implementsNode: false
              }
            });
          });
        });
      });

      test('it adds an order-level percentage discount to a checkout with a single line item via addDiscount', () => {
        const discountCode = 'ORDER50PERCENTOFF';

        return client.checkout.create({
          lineItems: [
            {
              variantId: 'gid://shopify/ProductVariant/50850334310456',
              quantity: 1
            }
          ]
        }).then((checkout) => {
          return client.checkout.addDiscount(checkout.id, discountCode).then((updatedCheckout) => {
            assert.equal(updatedCheckout.discountApplications.length, 1);
            assert.deepEqual(updatedCheckout.discountApplications[0], {
              __typename: 'DiscountCodeApplication',
              targetSelection: 'ALL',
              allocationMethod: 'ACROSS',
              targetType: 'LINE_ITEM',
              value: {
                percentage: 50,
                type: {
                  name: 'PricingValue',
                  kind: 'UNION'
                }
              },
              code: 'ORDER50PERCENTOFF',
              applicable: true,
              type: {
                name: 'DiscountCodeApplication',
                kind: 'OBJECT',
                fieldBaseTypes: {
                  applicable: 'Boolean',
                  code: 'String'
                },
                implementsNode: false
              },
              hasNextPage: false,
              hasPreviousPage: false,
              variableValues: {
                checkoutId: 'gid://shopify/Checkout/176e6acf15ea3953c077674bc695fa96?key=e252b32caa0c3ea0ff85c0c437853624',
                discountCode: 'ORDER50PERCENTOFF'
              }
            });
          });
        });
      });
    });

    suite('checkout with multiple line items', () => {
      test('adds a fixed amount discount to a checkout with multiple line items via addDiscount', () => {
        const discountCode = '10OFF';

        return client.checkout.create({
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
        }).then((checkout) => {
          return client.checkout.addDiscount(checkout.id, discountCode).then((updatedCheckout) => {
            // TODO: check for structure of discountApplications
            assert.equal(updatedCheckout.discountApplications.length, 1);
            assert.deepEqual(updatedCheckout.discountApplications[0], {
              allocatedAmount: {
                amount: '10.0',
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
              },
              discountApplication: {
                __typename: 'DiscountCodeApplication',
                targetSelection: 'ENTITLED',
                allocationMethod: 'EACH',
                targetType: 'LINE_ITEM',
                value: {
                  amount: '20.0',
                  currencyCode: 'CAD',
                  type: {
                    name: 'PricingValue',
                    kind: 'UNION'
                  }
                },
                code: '10OFF',
                applicable: true,
                type: {
                  name: 'DiscountCodeApplication',
                  kind: 'OBJECT',
                  fieldBaseTypes: {
                    applicable: 'Boolean',
                    code: 'String'
                  },
                  implementsNode: false
                }
              },
              type: {
                name: 'DiscountAllocation',
                kind: 'OBJECT',
                fieldBaseTypes: {
                  allocatedAmount: 'MoneyV2',
                  discountApplication: 'DiscountApplication'
                },
                implementsNode: false
              }
            });
            assert.equal(updatedCheckout.lineItems[0].discountAllocations.length, 1);
            assert.deepEqual(updatedCheckout.lineItems[0].discountAllocations[0], {
              allocatedAmount: {
                amount: '10.0',
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
              },
              discountApplication: {
                __typename: 'DiscountCodeApplication',
                targetSelection: 'ENTITLED',
                allocationMethod: 'EACH',
                targetType: 'LINE_ITEM',
                value: {
                  amount: '20.0',
                  currencyCode: 'CAD',
                  type: {
                    name: 'PricingValue',
                    kind: 'UNION'
                  }
                },
                code: '10OFF',
                applicable: true,
                type: {
                  name: 'DiscountCodeApplication',
                  kind: 'OBJECT',
                  fieldBaseTypes: {
                    applicable: 'Boolean',
                    code: 'String'
                  },
                  implementsNode: false
                }
              },
              type: {
                name: 'DiscountAllocation',
                kind: 'OBJECT',
                fieldBaseTypes: {
                  allocatedAmount: 'MoneyV2',
                  discountApplication: 'DiscountApplication'
                },
                implementsNode: false
              }
            });
            assert.equal(updatedCheckout.lineItems[1].discountAllocations.length, 1);
            assert.deepEqual(updatedCheckout.lineItems[1].discountAllocations[0], {
              __typename: 'DiscountCodeApplication',
              targetSelection: 'ENTITLED',
              allocationMethod: 'EACH',
              targetType: 'LINE_ITEM',
              value: {
                amount: '20.0',
                currencyCode: 'CAD',
                type: {
                  name: 'PricingValue',
                  kind: 'UNION'
                }
              },
              code: '10OFF',
              applicable: true,
              type: {
                name: 'DiscountCodeApplication',
                kind: 'OBJECT',
                fieldBaseTypes: {
                  applicable: 'Boolean',
                  code: 'String'
                },
                implementsNode: false
              },
              hasNextPage: false,
              hasPreviousPage: false,
              variableValues: {
                checkoutId: 'gid://shopify/Checkout/7b094d4eed72319ffff557ff7ebad1ec?key=fb67b4978d1ba56ed15bb8a216c330d0',
                discountCode: '10OFF'
              }
            });

          });
        });
      });

      test('adds a percentage discount to a checkout with multiple line items via addDiscount', () => {
        const discountCode = '10PERCENTOFF';

        return client.checkout.create({
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
        }).then((checkout) => {
          return client.checkout.addDiscount(checkout.id, discountCode).then((updatedCheckout) => {
            assert.equal(updatedCheckout.discountApplications.length, 1);
            assert.deepEqual(updatedCheckout.discountApplications[0], {
              __typename: 'DiscountCodeApplication',
              targetSelection: 'ENTITLED',
              allocationMethod: 'EACH',
              targetType: 'LINE_ITEM',
              value: {
                percentage: 10,
                type: {
                  name: 'PricingValue',
                  kind: 'UNION'
                }
              },
              code: '10PERCENTOFF',
              applicable: true,
              type: {
                name: 'DiscountCodeApplication',
                kind: 'OBJECT',
                fieldBaseTypes: {
                  applicable: 'Boolean',
                  code: 'String'
                },
                implementsNode: false
              },
              hasNextPage: false,
              hasPreviousPage: false,
              variableValues: {
                checkoutId: 'gid://shopify/Checkout/4b9b57cf11987488c086d3c26cc25954?key=de0d5a40602aa1de106a0f696e705cff',
                discountCode: '10PERCENTOFF'
              }
            });
            assert.equal(updatedCheckout.lineItems[0].discountAllocations.length, 1);
            assert.deepEqual(updatedCheckout.lineItems[0].discountAllocations[0], {
              allocatedAmount: {
                amount: '20.0',
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
              },
              discountApplication: {
                __typename: 'DiscountCodeApplication',
                targetSelection: 'ENTITLED',
                allocationMethod: 'EACH',
                targetType: 'LINE_ITEM',
                value: {
                  percentage: 10,
                  type: {
                    name: 'PricingValue',
                    kind: 'UNION'
                  }
                },
                code: '10PERCENTOFF',
                applicable: true,
                type: {
                  name: 'DiscountCodeApplication',
                  kind: 'OBJECT',
                  fieldBaseTypes: {
                    applicable: 'Boolean',
                    code: 'String'
                  },
                  implementsNode: false
                }
              },
              type: {
                name: 'DiscountAllocation',
                kind: 'OBJECT',
                fieldBaseTypes: {
                  allocatedAmount: 'MoneyV2',
                  discountApplication: 'DiscountApplication'
                },
                implementsNode: false
              }
            });
            assert.equal(updatedCheckout.lineItems[1].discountAllocations.length, 1);
            assert.deepEqual(updatedCheckout.lineItems[1].discountAllocations[0], {
              allocatedAmount: {
                amount: '7.0',
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
              },
              discountApplication: {
                __typename: 'DiscountCodeApplication',
                targetSelection: 'ENTITLED',
                allocationMethod: 'EACH',
                targetType: 'LINE_ITEM',
                value: {
                  percentage: 10,
                  type: {
                    name: 'PricingValue',
                    kind: 'UNION'
                  }
                },
                code: '10PERCENTOFF',
                applicable: true,
                type: {
                  name: 'DiscountCodeApplication',
                  kind: 'OBJECT',
                  fieldBaseTypes: {
                    applicable: 'Boolean',
                    code: 'String'
                  },
                  implementsNode: false
                }
              },
              type: {
                name: 'DiscountAllocation',
                kind: 'OBJECT',
                fieldBaseTypes: {
                  allocatedAmount: 'MoneyV2',
                  discountApplication: 'DiscountApplication'
                },
                implementsNode: false
              }
            });
          });
        });

      });

      test('adds an order-level fixed amount discount to a checkout with multiple line items via addDiscount', () => {
        const discountCode = 'ORDERFIXED50OFF';

        return client.checkout.create({
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
        }).then((checkout) => {
          return client.checkout.addDiscount(checkout.id, discountCode).then((updatedCheckout) => {
            assert.equal(updatedCheckout.discountApplications.length, 1);
            assert.deepEqual(updatedCheckout.discountApplications[0], {
              __typename: 'DiscountCodeApplication',
              targetSelection: 'ALL',
              allocationMethod: 'ACROSS',
              targetType: 'LINE_ITEM',
              value: {
                amount: '50.0',
                currencyCode: 'CAD',
                type: {
                  name: 'PricingValue',
                  kind: 'UNION'
                }
              },
              code: 'ORDERFIXED50OFF',
              applicable: true,
              type: {
                name: 'DiscountCodeApplication',
                kind: 'OBJECT',
                fieldBaseTypes: {
                  applicable: 'Boolean',
                  code: 'String'
                },
                implementsNode: false
              },
              hasNextPage: false,
              hasPreviousPage: false,
              variableValues: {
                checkoutId: 'gid://shopify/Checkout/b6de06fc6e622df31bc9adb0bb0638b8?key=aa2fa590da7be07d25124fc5606db474',
                discountCode: 'ORDERFIXED50OFF'
              }
            });
            assert.equal(updatedCheckout.lineItems[0].discountAllocations.length, 1);
            assert.deepEqual(updatedCheckout.lineItems[0].discountAllocations[0], {
              allocatedAmount: {
                amount: '37.04',
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
              },
              discountApplication: {
                __typename: 'DiscountCodeApplication',
                targetSelection: 'ALL',
                allocationMethod: 'ACROSS',
                targetType: 'LINE_ITEM',
                value: {
                  amount: '50.0',
                  currencyCode: 'CAD',
                  type: {
                    name: 'PricingValue',
                    kind: 'UNION'
                  }
                },
                code: 'ORDERFIXED50OFF',
                applicable: true,
                type: {
                  name: 'DiscountCodeApplication',
                  kind: 'OBJECT',
                  fieldBaseTypes: {
                    applicable: 'Boolean',
                    code: 'String'
                  },
                  implementsNode: false
                }
              },
              type: {
                name: 'DiscountAllocation',
                kind: 'OBJECT',
                fieldBaseTypes: {
                  allocatedAmount: 'MoneyV2',
                  discountApplication: 'DiscountApplication'
                },
                implementsNode: false
              }
            });
            assert.equal(updatedCheckout.lineItems[1].discountAllocations.length, 1);
            assert.deepEqual(updatedCheckout.lineItems[1].discountAllocations[0], {
              allocatedAmount: {
                amount: '12.96',
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
              },
              discountApplication: {
                __typename: 'DiscountCodeApplication',
                targetSelection: 'ALL',
                allocationMethod: 'ACROSS',
                targetType: 'LINE_ITEM',
                value: {
                  amount: '50.0',
                  currencyCode: 'CAD',
                  type: {
                    name: 'PricingValue',
                    kind: 'UNION'
                  }
                },
                code: 'ORDERFIXED50OFF',
                applicable: true,
                type: {
                  name: 'DiscountCodeApplication',
                  kind: 'OBJECT',
                  fieldBaseTypes: {
                    applicable: 'Boolean',
                    code: 'String'
                  },
                  implementsNode: false
                }
              },
              type: {
                name: 'DiscountAllocation',
                kind: 'OBJECT',
                fieldBaseTypes: {
                  allocatedAmount: 'MoneyV2',
                  discountApplication: 'DiscountApplication'
                },
                implementsNode: false
              }
            });
          });
        });
      });

      // NOTE: We can't map this because updatedCheckout does not create a discountAllocation for the order-level discount on empty carts
      // all we have to work with is discountCodes: [ { "applicable": false, "code": "ORDER50PERCENTOFF" } ]
      test('adds an order-level percentage discount to a checkout with multiple line items via addDiscount', () => {
        const discountCode = 'ORDER50PERCENTOFF';

        return client.checkout.create({
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
        }).then((checkout) => {
          return client.checkout.addDiscount(checkout.id, discountCode).then((updatedCheckout) => {
            assert.equal(updatedCheckout.discountApplications.length, 1);
            assert.deepEqual(updatedCheckout.discountApplications[0], {
              __typename: 'DiscountCodeApplication',
              targetSelection: 'ALL',
              allocationMethod: 'ACROSS',
              targetType: 'LINE_ITEM',
              value: {
                percentage: 50,
                type: {
                  name: 'PricingValue',
                  kind: 'UNION'
                }
              },
              code: 'ORDER50PERCENTOFF',
              applicable: true,
              type: {
                name: 'DiscountCodeApplication',
                kind: 'OBJECT',
                fieldBaseTypes: {
                  applicable: 'Boolean',
                  code: 'String'
                },
                implementsNode: false
              },
              hasNextPage: false,
              hasPreviousPage: false,
              variableValues: {
                checkoutId: 'gid://shopify/Checkout/2a45b2a7497f72213129cd312e355395?key=3318f8152c39a5e5ef82c2e86f427ee6',
                discountCode: 'ORDER50PERCENTOFF'
              }
            });
            assert.equal(updatedCheckout.lineItems[0].discountAllocations.length, 1);
            assert.deepEqual(updatedCheckout.lineItems[0].discountAllocations[0], {
              allocatedAmount: {
                amount: '100.0',
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
              },
              discountApplication: {
                __typename: 'DiscountCodeApplication',
                targetSelection: 'ALL',
                allocationMethod: 'ACROSS',
                targetType: 'LINE_ITEM',
                value: {
                  percentage: 50,
                  type: {
                    name: 'PricingValue',
                    kind: 'UNION'
                  }
                },
                code: 'ORDER50PERCENTOFF',
                applicable: true,
                type: {
                  name: 'DiscountCodeApplication',
                  kind: 'OBJECT',
                  fieldBaseTypes: {
                    applicable: 'Boolean',
                    code: 'String'
                  },
                  implementsNode: false
                }
              },
              type: {
                name: 'DiscountAllocation',
                kind: 'OBJECT',
                fieldBaseTypes: {
                  allocatedAmount: 'MoneyV2',
                  discountApplication: 'DiscountApplication'
                },
                implementsNode: false
              }
            });
            assert.equal(updatedCheckout.lineItems[1].discountAllocations.length, 1);
            assert.deepEqual(updatedCheckout.lineItems[1].discountAllocations[0], {
              __typename: 'DiscountCodeApplication',
              targetSelection: 'ALL',
              allocationMethod: 'ACROSS',
              targetType: 'LINE_ITEM',
              value: {
                percentage: 50,
                type: {
                  name: 'PricingValue',
                  kind: 'UNION'
                }
              },
              code: 'ORDER50PERCENTOFF',
              applicable: true,
              type: {
                name: 'DiscountCodeApplication',
                kind: 'OBJECT',
                fieldBaseTypes: {
                  applicable: 'Boolean',
                  code: 'String'
                },
                implementsNode: false
              },
              hasNextPage: false,
              hasPreviousPage: false,
              variableValues: {
                checkoutId: 'gid://shopify/Checkout/2a45b2a7497f72213129cd312e355395?key=3318f8152c39a5e5ef82c2e86f427ee6',
                discountCode: 'ORDER50PERCENTOFF'
              }
            });
          });
        });
      });
    });
  });

  suite('addDiscount / not supported', () => {
    suite('empty checkout', () => {
      // NOTE: We can't map this because updatedCheckout does not create a discountAllocation for the order-level discount on empty carts
      // all we have to work with is discountCodes: [ { "applicable": false, "code": "ORDERFIXED50OFF" } ]
      test('it adds an order-level fixed amount discount to an empty checkout via addDiscount', () => {
        const discountCode = 'ORDERFIXED50OFF';

        return client.checkout.create({}).then((checkout) => {
          return client.checkout.addDiscount(checkout.id, discountCode).then((updatedCheckout) => {
            assert.deepEqual(updatedCheckout.discountApplications[0], {
              __typename: 'DiscountCodeApplication',
              targetSelection: 'ALL',
              allocationMethod: 'ACROSS',
              targetType: 'LINE_ITEM',
              value: {
                amount: '0.0',
                currencyCode: 'CAD',
                type: {
                  name: 'PricingValue',
                  kind: 'UNION'
                }
              },
              code: 'ORDERFIXED50OFF',
              applicable: true,
              type: {
                name: 'DiscountCodeApplication',
                kind: 'OBJECT',
                fieldBaseTypes: {
                  applicable: 'Boolean',
                  code: 'String'
                },
                implementsNode: false
              },
              hasNextPage: false,
              hasPreviousPage: false,
              variableValues: {
                checkoutId: 'gid://shopify/Checkout/691e9abfdb5b913c8a2ae1bc7ac97367?key=afec92d9a7c509fe9a750e7af9e54b4a',
                discountCode: 'ORDERFIXED50OFF'
              }
            }
            );
          });
        });
      });
    });

    test('it adds an order-level percentage discount to an empty checkout via addDiscount', () => {
      const discountCode = 'ORDER50PERCENTOFF';

      return client.checkout.create({}).then((checkout) => {
        return client.checkout.addDiscount(checkout.id, discountCode).then((updatedCheckout) => {
          assert.equal(updatedCheckout.discountApplications[0], {
            __typename: 'DiscountCodeApplication',
            targetSelection: 'ALL',
            allocationMethod: 'ACROSS',
            targetType: 'LINE_ITEM',
            value: {
              percentage: 50,
              type: {
                name: 'PricingValue',
                kind: 'UNION'
              }
            },
            code: 'ORDER50PERCENTOFF',
            applicable: true,
            type: {
              name: 'DiscountCodeApplication',
              kind: 'OBJECT',
              fieldBaseTypes: {
                applicable: 'Boolean',
                code: 'String'
              },
              implementsNode: false
            },
            hasNextPage: false,
            hasPreviousPage: false,
            variableValues: {
              checkoutId: 'gid://shopify/Checkout/bc569367501dd75c7902f633b8e32212?key=6b03d9b61df6dcde7a255b25e133f566',
              discountCode: 'ORDER50PERCENTOFF'
            }
          }
          );
        });
      });
    });
  });

  suite('removeDiscount', () => {});

});
