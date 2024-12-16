import assert from 'assert';
import Client from '../src/client';

// NOTE:
// graphql.myshopify.com
// gid://shopify/ProductVariant/50850334310456 Arena Zip Boot SDK
// gid://shopify/ProductVariant/50850336211000 Brace Tonic Crew SDK /48535896555542

// NOTE:
// graphql.myshopify.com
// gid://shopify/ProductVariant/50850334310456 Arena Zip Boot SDK
// gid://shopify/ProductVariant/50850336211000 Brace Tonic Crew SDK /48535896555542

suite('client-checkout-discounts-integration-test', () => {
  const domain = 'graphql.myshopify.com';

  // Helper function to compare currency amounts within 1 cent tolerance
  const assertAmountsEqual = (actual, expected, message) => {
    const actualNum = parseFloat(actual);
    const expectedNum = parseFloat(expected);
    const diff = Math.abs(actualNum - expectedNum);

    assert.ok(diff <= 0.01, message || `Expected ${actual} to be within 0.01 of ${expected}`);
  };

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
            assert.equal(updatedCheckout.lineItems.length, 0);
          });
        });
      });

      test('it does not add a percentage discount to an empty checkout via addDiscount', () => {
        const discountCode = '10PERCENTOFF';

        return client.checkout.create({}).then((checkout) => {
          return client.checkout.addDiscount(checkout.id, discountCode).then((updatedCheckout) => {
            assert.equal(updatedCheckout.discountApplications.length, 0);
            assert.equal(updatedCheckout.lineItems.length, 0);
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
            // console.log('updatedCheckout', JSON.stringify(updatedCheckout, null, 2));
            assert.equal(updatedCheckout.discountApplications.length, 1);
            assert.equal(updatedCheckout.lineItems[0].discountAllocations.length, 1);
            // top-level discountApplication exists

            const expectedDiscountApplications = [
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
            ];
            // assert.deepStrictEqual(updatedCheckout.discountApplications, expectedDiscountApplications);

            assert.equal(updatedCheckout.discountApplications[0].code, expectedDiscountApplications[0].code);
            assert.equal(updatedCheckout.discountApplications[0].targetSelection, expectedDiscountApplications[0].targetSelection);
            assert.equal(updatedCheckout.discountApplications[0].allocationMethod, expectedDiscountApplications[0].allocationMethod);
            assert.equal(updatedCheckout.discountApplications[0].targetType, expectedDiscountApplications[0].targetType);
            assert.equal(updatedCheckout.discountApplications[0].value.amount, expectedDiscountApplications[0].value.amount);
            assert.equal(updatedCheckout.discountApplications[0].value.currencyCode, expectedDiscountApplications[0].value.currencyCode);
            assert.deepEqual(updatedCheckout.discountApplications[0].value.type, expectedDiscountApplications[0].value.type);
            assert.equal(updatedCheckout.discountApplications[0].applicable, expectedDiscountApplications[0].applicable);
            assert.equal(updatedCheckout.discountApplications[0].title, expectedDiscountApplications[0].title);
            // console.log(JSON.stringify(updatedCheckout.discountApplications, null, 2));
            // console.log('--------------------------------');
            // console.log(JSON.stringify(updatedCheckout.lineItems[0].discountAllocations, null, 2));


            // assert.deepStrictEqual(
            //   deepSortDiscountApplications(result.discountApplications),
            //   deepSortDiscountApplications(expectedDiscountApplications)
            // );

            // const sortedResult = deepSortLines(result.lineItems);
            // const sortedExpected = deepSortLines(expectedLineItems);

            // for (let i = 0; i < result.lineItems.length; i++) {
            //   assert.deepStrictEqual(sortedResult[i].discountAllocations, sortedExpected[i].discountAllocations);
            // }


            // top-level discountApplications matches expected structure
            // assert.deepEqual(updatedCheckout.discountApplications[0],
            //   {
            //     __typename: 'DiscountCodeApplication',
            //     targetSelection: 'ENTITLED',
            //     allocationMethod: 'EACH',
            //     targetType: 'LINE_ITEM',
            //     value: {
            //       amount: '10.0',
            //       currencyCode: 'USD',
            //       type: {
            //         name: 'PricingValue',
            //         kind: 'UNION'
            //       }
            //     },
            //     code: '10OFF',
            //     applicable: true,
            //     type: {
            //       name: 'DiscountCodeApplication',
            //       kind: 'OBJECT',
            //       fieldBaseTypes: {
            //         applicable: 'Boolean',
            //         code: 'String'
            //       },
            //       implementsNode: false
            //     },
            //     hasNextPage: false,
            //     hasPreviousPage: false,
            //     variableValues: {
            //       checkoutId: 'gid://shopify/Checkout/e780a1b5bffd6a9ef530f1718b854e4f?key=f06572e061a9cc7e3b73e9a235239f42',
            //       discountCode: '10OFF'
            //     }
            //   }
            // );

            // line item discountAllocation exists


            // line item discountAllocation matches expected structure
            // assert.equal(updatedCheckout.lineItems[0].discountAllocations[0], {
            //   allocatedAmount: {
            //     amount: '10.0',
            //     currencyCode: 'CAD',
            //     type: {
            //       name: 'MoneyV2',
            //       kind: 'OBJECT',
            //       fieldBaseTypes: {
            //         amount: 'Decimal',
            //         currencyCode: 'CurrencyCode'
            //       },
            //       implementsNode: false
            //     }
            //   },
            //   discountApplication: {
            //     __typename: 'DiscountCodeApplication',
            //     targetSelection: 'ENTITLED',
            //     allocationMethod: 'EACH',
            //     targetType: 'LINE_ITEM',
            //     value: {
            //       amount: '10.0',
            //       currencyCode: 'CAD',
            //       type: {
            //         name: 'PricingValue',
            //         kind: 'UNION'
            //       }
            //     },
            //     code: '10OFF',
            //     applicable: true,
            //     type: {
            //       name: 'DiscountCodeApplication',
            //       kind: 'OBJECT',
            //       fieldBaseTypes: {
            //         applicable: 'Boolean',
            //         code: 'String'
            //       },
            //       implementsNode: false
            //     }
            //   },
            //   type: {
            //     name: 'DiscountAllocation',
            //     kind: 'OBJECT',
            //     fieldBaseTypes: {
            //       allocatedAmount: 'MoneyV2',
            //       discountApplication: 'DiscountApplication'
            //     },
            //     implementsNode: false
            //   }
            // }
            // );

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

            const expectedRootDiscountApplications = [
              {
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
              }
            ];

            // assert.deepEqual(updatedCheckout.discountApplications, expectedRootDiscountApplications);
            assert.equal(updatedCheckout.discountApplications[0].code, expectedRootDiscountApplications[0].code);
            assert.equal(updatedCheckout.discountApplications[0].targetSelection, expectedRootDiscountApplications[0].targetSelection);
            assert.equal(updatedCheckout.discountApplications[0].allocationMethod, expectedRootDiscountApplications[0].allocationMethod);
            assert.equal(updatedCheckout.discountApplications[0].targetType, expectedRootDiscountApplications[0].targetType);
            assert.equal(updatedCheckout.discountApplications[0].value.amount, expectedRootDiscountApplications[0].value.amount);
            assert.equal(updatedCheckout.discountApplications[0].value.currencyCode, expectedRootDiscountApplications[0].value.currencyCode);
            assert.deepEqual(updatedCheckout.discountApplications[0].value.type, expectedRootDiscountApplications[0].value.type);
            assert.equal(updatedCheckout.discountApplications[0].applicable, expectedRootDiscountApplications[0].applicable);
            assert.equal(updatedCheckout.discountApplications[0].title, expectedRootDiscountApplications[0].title);

            const expectedLineItemDiscountAllocations = [
              {
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
              }
            ];

            // assert.deepEqual(updatedCheckout.lineItems[0].discountAllocations, expectedLineItemDiscountAllocations);
            assert.equal(updatedCheckout.lineItems[0].discountAllocations.length, 1);
            assert.deepEqual(updatedCheckout.lineItems[0].discountAllocations[0].discountApplication.code, expectedLineItemDiscountAllocations[0].discountApplication.code);
            assert.deepEqual(updatedCheckout.lineItems[0].discountAllocations[0].discountApplication.targetSelection, expectedLineItemDiscountAllocations[0].discountApplication.targetSelection);
            assert.deepEqual(updatedCheckout.lineItems[0].discountAllocations[0].discountApplication.allocationMethod, expectedLineItemDiscountAllocations[0].discountApplication.allocationMethod);
            assert.deepEqual(updatedCheckout.lineItems[0].discountAllocations[0].discountApplication.targetType, expectedLineItemDiscountAllocations[0].discountApplication.targetType);
            assert.deepEqual(updatedCheckout.lineItems[0].discountAllocations[0].allocatedAmount.amount, expectedLineItemDiscountAllocations[0].allocatedAmount.amount);
            assert.deepEqual(updatedCheckout.lineItems[0].discountAllocations[0].allocatedAmount.currencyCode, expectedLineItemDiscountAllocations[0].allocatedAmount.currencyCode);
            assert.deepEqual(updatedCheckout.lineItems[0].discountAllocations[0].discountApplication.value.type, expectedLineItemDiscountAllocations[0].discountApplication.value.type);
            assert.deepEqual(updatedCheckout.lineItems[0].discountAllocations[0].discountApplication.applicable, expectedLineItemDiscountAllocations[0].discountApplication.applicable);
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
            const expectedRootDiscountApplications = [
              {
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
              }
            ];

            // assert.deepEqual(updatedCheckout.discountApplications, expectedRootDiscountApplications);
            assert.equal(updatedCheckout.discountApplications.length, 1);
            assert.equal(updatedCheckout.discountApplications[0].code, expectedRootDiscountApplications[0].code);
            assert.equal(updatedCheckout.discountApplications[0].targetSelection, expectedRootDiscountApplications[0].targetSelection);
            assert.equal(updatedCheckout.discountApplications[0].allocationMethod, expectedRootDiscountApplications[0].allocationMethod);
            assert.equal(updatedCheckout.discountApplications[0].targetType, expectedRootDiscountApplications[0].targetType);
            assert.equal(updatedCheckout.discountApplications[0].value.amount, expectedRootDiscountApplications[0].value.amount);
            assert.equal(updatedCheckout.discountApplications[0].value.currencyCode, expectedRootDiscountApplications[0].value.currencyCode);
            assert.deepEqual(updatedCheckout.discountApplications[0].value.type, expectedRootDiscountApplications[0].value.type);
            assert.equal(updatedCheckout.discountApplications[0].applicable, expectedRootDiscountApplications[0].applicable);
            assert.equal(updatedCheckout.discountApplications[0].title, expectedRootDiscountApplications[0].title);

            const expectedLineItemDiscountAllocations = [
              {
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
              }
            ];

            // assert.deepEqual(updatedCheckout.lineItems[0].discountAllocations, expectedLineItemDiscountAllocations);
            assert.equal(updatedCheckout.lineItems[0].discountAllocations.length, 1);
            assert.deepEqual(updatedCheckout.lineItems[0].discountAllocations[0].discountApplication.code, expectedLineItemDiscountAllocations[0].discountApplication.code);
            assert.deepEqual(updatedCheckout.lineItems[0].discountAllocations[0].discountApplication.targetSelection, expectedLineItemDiscountAllocations[0].discountApplication.targetSelection);
            assert.deepEqual(updatedCheckout.lineItems[0].discountAllocations[0].discountApplication.allocationMethod, expectedLineItemDiscountAllocations[0].discountApplication.allocationMethod);
            assert.deepEqual(updatedCheckout.lineItems[0].discountAllocations[0].discountApplication.targetType, expectedLineItemDiscountAllocations[0].discountApplication.targetType);
            assert.deepEqual(updatedCheckout.lineItems[0].discountAllocations[0].allocatedAmount.amount, expectedLineItemDiscountAllocations[0].allocatedAmount.amount);
            assert.deepEqual(updatedCheckout.lineItems[0].discountAllocations[0].allocatedAmount.currencyCode, expectedLineItemDiscountAllocations[0].allocatedAmount.currencyCode);
            assert.deepEqual(updatedCheckout.lineItems[0].discountAllocations[0].discountApplication.value.type, expectedLineItemDiscountAllocations[0].discountApplication.value.type);
            assert.deepEqual(updatedCheckout.lineItems[0].discountAllocations[0].discountApplication.applicable, expectedLineItemDiscountAllocations[0].discountApplication.applicable);
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
            const expectedRootDiscountApplications = [
              {
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
              }
            ];

            assert.equal(updatedCheckout.discountApplications.length, 1);
            // assert.deepEqual(updatedCheckout.discountApplications, expectedRootDiscountApplications);
            assert.equal(updatedCheckout.discountApplications[0].code, expectedRootDiscountApplications[0].code);
            assert.equal(updatedCheckout.discountApplications[0].targetSelection, expectedRootDiscountApplications[0].targetSelection);
            assert.equal(updatedCheckout.discountApplications[0].allocationMethod, expectedRootDiscountApplications[0].allocationMethod);
            assert.equal(updatedCheckout.discountApplications[0].targetType, expectedRootDiscountApplications[0].targetType);
            assert.equal(updatedCheckout.discountApplications[0].value.amount, expectedRootDiscountApplications[0].value.amount);
            assert.equal(updatedCheckout.discountApplications[0].value.currencyCode, expectedRootDiscountApplications[0].value.currencyCode);
            assert.deepEqual(updatedCheckout.discountApplications[0].value.type, expectedRootDiscountApplications[0].value.type);
            assert.equal(updatedCheckout.discountApplications[0].applicable, expectedRootDiscountApplications[0].applicable);
            assert.equal(updatedCheckout.discountApplications[0].title, expectedRootDiscountApplications[0].title);
          });
        });
      });
    });

    suite.only('checkout with multiple line items', () => {
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
            const expectedRootDiscountApplications = [
              {
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
              }
            ];

            // NOTE: the second item in this array was just the discount APPLICATION, not the discount ALLOCATION (with
            // application inside). I therefore had to manually modify the fixture to be the correct discount allocation.
            // Given that we know the discount application value and there's only one discount, we can trust the modified fixture.
            const expectedLineItemDiscountAllocations = [{
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
            },
              {
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
              }
            ];

            assert.deepEqual(updatedCheckout.discountApplications[0], expectedRootDiscountApplications[0]);
            assert.equal(updatedCheckout.discountApplications.length, 1);
            assert.equal(updatedCheckout.discountApplications[0].code, expectedRootDiscountApplications[0].code);
            assert.equal(updatedCheckout.discountApplications[0].targetSelection, expectedRootDiscountApplications[0].targetSelection);
            assert.equal(updatedCheckout.discountApplications[0].allocationMethod, expectedRootDiscountApplications[0].allocationMethod);
            assert.equal(updatedCheckout.discountApplications[0].targetType, expectedRootDiscountApplications[0].targetType);
            assert.equal(updatedCheckout.discountApplications[0].value.amount, expectedRootDiscountApplications[0].value.amount);
            assert.equal(updatedCheckout.discountApplications[0].value.currencyCode, expectedRootDiscountApplications[0].value.currencyCode);
            assert.deepEqual(updatedCheckout.discountApplications[0].value.type, expectedRootDiscountApplications[0].value.type);
            assert.equal(updatedCheckout.discountApplications[0].applicable, expectedRootDiscountApplications[0].applicable);
            assert.equal(updatedCheckout.discountApplications[0].title, expectedRootDiscountApplications[0].title);

            for (let i = 0; i < updatedCheckout.lineItems.length; i++) {
              assert.equal(updatedCheckout.lineItems[i].discountAllocations.length, 1);
              const actualDiscountAllocation = updatedCheckout.lineItems[i].discountAllocations[0];
              const expectedDiscountAllocation = expectedLineItemDiscountAllocations[i];

              // assert.deepEqual(actualDiscountAllocation, expectedDiscountAllocation);
              assert.equal(actualDiscountAllocation.discountApplication.code, expectedDiscountAllocation.discountApplication.code);
              assert.equal(actualDiscountAllocation.discountApplication.targetSelection, expectedDiscountAllocation.discountApplication.targetSelection);
              assert.equal(actualDiscountAllocation.discountApplication.allocationMethod, expectedDiscountAllocation.discountApplication.allocationMethod);
              assert.equal(actualDiscountAllocation.discountApplication.targetType, expectedDiscountAllocation.discountApplication.targetType);
              assertAmountsEqual(actualDiscountAllocation.allocatedAmount.amount, expectedDiscountAllocation.allocatedAmount.amount);
              assert.equal(actualDiscountAllocation.allocatedAmount.currencyCode, expectedDiscountAllocation.allocatedAmount.currencyCode);
              assert.deepEqual(actualDiscountAllocation.discountApplication.value.type, expectedDiscountAllocation.discountApplication.value.type);
              assert.equal(actualDiscountAllocation.discountApplication.applicable, expectedDiscountAllocation.discountApplication.applicable);
            }
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
            const expectedRootDiscountApplications = [
              {
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
              }
            ];

            const expectedLineItemDiscountAllocations = [
              {
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
              },
              {
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
              }
            ];

            assert.equal(updatedCheckout.discountApplications.length, 1);

            const expectedRootDiscountApplication = expectedRootDiscountApplications[0];
            const actualRootDiscountApplication = updatedCheckout.discountApplications[0];

            // assert.deepEqual(actualRootDiscountApplication, expectedRootDiscountApplication);
            assert.equal(actualRootDiscountApplication.code, expectedRootDiscountApplication.code);
            assert.equal(actualRootDiscountApplication.targetSelection, expectedRootDiscountApplication.targetSelection);
            assert.equal(actualRootDiscountApplication.allocationMethod, expectedRootDiscountApplication.allocationMethod);
            assert.equal(actualRootDiscountApplication.targetType, expectedRootDiscountApplication.targetType);
            assert.equal(actualRootDiscountApplication.value.amount, expectedRootDiscountApplication.value.amount);
            assert.equal(actualRootDiscountApplication.value.currencyCode, expectedRootDiscountApplication.value.currencyCode);
            assert.deepEqual(actualRootDiscountApplication.value.type, expectedRootDiscountApplication.value.type);
            assert.equal(actualRootDiscountApplication.applicable, expectedRootDiscountApplication.applicable);
            assert.equal(actualRootDiscountApplication.title, expectedRootDiscountApplication.title);

            assert.equal(updatedCheckout.lineItems.length, 2);
            assert.equal(updatedCheckout.lineItems[0].discountAllocations.length, 1);
            assert.equal(updatedCheckout.lineItems[1].discountAllocations.length, 1);
            for (let i = 0; i < updatedCheckout.lineItems.length; i++) {
              assert.equal(updatedCheckout.lineItems[i].discountAllocations.length, 1);
              const actualDiscountAllocation = updatedCheckout.lineItems[i].discountAllocations[0];
              // The actual order is inverted but we are not guaranteeing we will preserve the ordering, just that
              // all the line items/discount allocations are present and correct.
              const expectedDiscountAllocation = expectedLineItemDiscountAllocations[(expectedLineItemDiscountAllocations.length - 1) - i];

              // assert.deepEqual(actualDiscountAllocation, expectedDiscountAllocation);
              assert.equal(actualDiscountAllocation.discountApplication.code, expectedDiscountAllocation.discountApplication.code);
              assert.equal(actualDiscountAllocation.discountApplication.targetSelection, expectedDiscountAllocation.discountApplication.targetSelection);
              assert.equal(actualDiscountAllocation.discountApplication.allocationMethod, expectedDiscountAllocation.discountApplication.allocationMethod);
              assert.equal(actualDiscountAllocation.discountApplication.targetType, expectedDiscountAllocation.discountApplication.targetType);
              assertAmountsEqual(actualDiscountAllocation.allocatedAmount.amount, expectedDiscountAllocation.allocatedAmount.amount);
              assert.equal(actualDiscountAllocation.allocatedAmount.currencyCode, expectedDiscountAllocation.allocatedAmount.currencyCode);
              assert.deepEqual(actualDiscountAllocation.discountApplication.value.type, expectedDiscountAllocation.discountApplication.value.type);
              assert.equal(actualDiscountAllocation.discountApplication.applicable, expectedDiscountAllocation.discountApplication.applicable);
            }
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
            const expectedRootDiscountApplications = [
              {
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
              }
            ];
            const expectedLineItemDiscountAllocations = [
              {
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
              },
              {
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
              }
            ];

            assert.equal(updatedCheckout.discountApplications.length, 1);

            const expectedRootDiscountApplication = expectedRootDiscountApplications[0];
            const actualRootDiscountApplication = updatedCheckout.discountApplications[0];

            // assert.deepEqual(actualRootDiscountApplication, expectedRootDiscountApplication);
            assert.equal(actualRootDiscountApplication.code, expectedRootDiscountApplication.code);
            assert.equal(actualRootDiscountApplication.targetSelection, expectedRootDiscountApplication.targetSelection);
            assert.equal(actualRootDiscountApplication.allocationMethod, expectedRootDiscountApplication.allocationMethod);
            assert.equal(actualRootDiscountApplication.targetType, expectedRootDiscountApplication.targetType);
            assert.equal(actualRootDiscountApplication.value.amount, expectedRootDiscountApplication.value.amount);
            assert.equal(actualRootDiscountApplication.value.currencyCode, expectedRootDiscountApplication.value.currencyCode);
            assert.deepEqual(actualRootDiscountApplication.value.type, expectedRootDiscountApplication.value.type);
            assert.equal(actualRootDiscountApplication.applicable, expectedRootDiscountApplication.applicable);
            assert.equal(actualRootDiscountApplication.title, expectedRootDiscountApplication.title);

            assert.equal(updatedCheckout.lineItems.length, 2);
            assert.equal(updatedCheckout.lineItems[0].discountAllocations.length, 1);
            assert.equal(updatedCheckout.lineItems[1].discountAllocations.length, 1);
            for (let i = 0; i < updatedCheckout.lineItems.length; i++) {
              assert.equal(updatedCheckout.lineItems[i].discountAllocations.length, 1);
              const actualDiscountAllocation = updatedCheckout.lineItems[i].discountAllocations[0];
              // The actual order is inverted but we are not guaranteeing we will preserve the ordering, just that
              // all the line items/discount allocations are present and correct.
              const expectedDiscountAllocation = expectedLineItemDiscountAllocations[(expectedLineItemDiscountAllocations.length - 1) - i];

              // assert.deepEqual(actualDiscountAllocation, expectedDiscountAllocation);
              assert.equal(actualDiscountAllocation.discountApplication.code, expectedDiscountAllocation.discountApplication.code);
              assert.equal(actualDiscountAllocation.discountApplication.targetSelection, expectedDiscountAllocation.discountApplication.targetSelection);
              assert.equal(actualDiscountAllocation.discountApplication.allocationMethod, expectedDiscountAllocation.discountApplication.allocationMethod);
              assert.equal(actualDiscountAllocation.discountApplication.targetType, expectedDiscountAllocation.discountApplication.targetType);
              assertAmountsEqual(actualDiscountAllocation.allocatedAmount.amount, expectedDiscountAllocation.allocatedAmount.amount);
              assert.equal(actualDiscountAllocation.allocatedAmount.currencyCode, expectedDiscountAllocation.allocatedAmount.currencyCode);
              assert.deepEqual(actualDiscountAllocation.discountApplication.value.type, expectedDiscountAllocation.discountApplication.value.type);
              assert.equal(actualDiscountAllocation.discountApplication.applicable, expectedDiscountAllocation.discountApplication.applicable);
            }
          });
        });
      });

      // NOTE: We can't map this because updatedCheckout does not create a discountAllocation for the order-level discount on empty carts
      // all we have to work with is discountCodes: [ { "applicable": false, "code": "ORDER50PERCENTOFF" } ]
      test.only('adds an order-level percentage discount to a checkout with multiple line items via addDiscount', () => {
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
            const expectedRootDiscountApplications = [
              {
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
              }
            ];
            const expectedLineItemDiscountAllocations = [
              {
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
              },
              {
                allocatedAmount: {
                  amount: '35.0',
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
                  },
                  hasNextPage: false,
                  hasPreviousPage: false,
                  variableValues: {
                    checkoutId: 'gid://shopify/Checkout/2a45b2a7497f72213129cd312e355395?key=3318f8152c39a5e5ef82c2e86f427ee6',
                    discountCode: 'ORDER50PERCENTOFF'
                  }
                }
              }
            ];

            assert.equal(updatedCheckout.discountApplications.length, 1);

            const expectedRootDiscountApplication = expectedRootDiscountApplications[0];
            const actualRootDiscountApplication = updatedCheckout.discountApplications[0];

            // assert.deepEqual(actualRootDiscountApplication, expectedRootDiscountApplication);
            assert.equal(actualRootDiscountApplication.code, expectedRootDiscountApplication.code);
            assert.equal(actualRootDiscountApplication.targetSelection, expectedRootDiscountApplication.targetSelection);
            assert.equal(actualRootDiscountApplication.allocationMethod, expectedRootDiscountApplication.allocationMethod);
            assert.equal(actualRootDiscountApplication.targetType, expectedRootDiscountApplication.targetType);
            assert.equal(actualRootDiscountApplication.value.amount, expectedRootDiscountApplication.value.amount);
            assert.equal(actualRootDiscountApplication.value.currencyCode, expectedRootDiscountApplication.value.currencyCode);
            assert.deepEqual(actualRootDiscountApplication.value.type, expectedRootDiscountApplication.value.type);
            assert.equal(actualRootDiscountApplication.applicable, expectedRootDiscountApplication.applicable);
            assert.equal(actualRootDiscountApplication.title, expectedRootDiscountApplication.title);

            assert.equal(updatedCheckout.lineItems.length, 2);
            assert.equal(updatedCheckout.lineItems[0].discountAllocations.length, 1);
            assert.equal(updatedCheckout.lineItems[1].discountAllocations.length, 1);
            for (let i = 0; i < updatedCheckout.lineItems.length; i++) {
              assert.equal(updatedCheckout.lineItems[i].discountAllocations.length, 1);
              const actualDiscountAllocation = updatedCheckout.lineItems[i].discountAllocations[0];
              // The actual order is inverted but we are not guaranteeing we will preserve the ordering, just that
              // all the line items/discount allocations are present and correct.
              const expectedDiscountAllocation = expectedLineItemDiscountAllocations[(expectedLineItemDiscountAllocations.length - 1) - i];

              // assert.deepEqual(actualDiscountAllocation, expectedDiscountAllocation);
              assert.equal(actualDiscountAllocation.discountApplication.code, expectedDiscountAllocation.discountApplication.code);
              assert.equal(actualDiscountAllocation.discountApplication.targetSelection, expectedDiscountAllocation.discountApplication.targetSelection);
              assert.equal(actualDiscountAllocation.discountApplication.allocationMethod, expectedDiscountAllocation.discountApplication.allocationMethod);
              assert.equal(actualDiscountAllocation.discountApplication.targetType, expectedDiscountAllocation.discountApplication.targetType);
              assertAmountsEqual(actualDiscountAllocation.allocatedAmount.amount, expectedDiscountAllocation.allocatedAmount.amount);
              assert.equal(actualDiscountAllocation.allocatedAmount.currencyCode, expectedDiscountAllocation.allocatedAmount.currencyCode);
              assert.deepEqual(actualDiscountAllocation.discountApplication.value.type, expectedDiscountAllocation.discountApplication.value.type);
              assert.equal(actualDiscountAllocation.discountApplication.applicable, expectedDiscountAllocation.discountApplication.applicable);
            }
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
