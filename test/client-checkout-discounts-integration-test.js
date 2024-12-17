import assert from 'assert';
import Client from '../src/client';

// Helper function to compare currency amounts within 1 cent tolerance
function assertAmountsEqual(actual, expected, message) {
  const actualNum = parseFloat(actual);
  const expectedNum = parseFloat(expected);
  const diff = Math.abs(actualNum - expectedNum);

  assert.ok(diff <= 0.01, message || `Expected ${actual} to be within 0.01 of ${expected}`);
}

// Helper function to clean discount application objects by removing __typename and type.name fields
// These fields are different between cart and checkout, so to compare the objects we need to remove them
function comparableDiscountApplication(discountApp) {
  if (!discountApp || typeof discountApp !== 'object') {
    return discountApp;
  }

  // Create a deep copy to avoid modifying the original object
  const cleaned = JSON.parse(JSON.stringify(discountApp));

  // Remove __typename at root level
  delete cleaned.__typename;

  // Remove type.name if it exists
  if (cleaned.type && cleaned.type.name) {
    delete cleaned.type.name;
  }

  // We aren't guaranteeing this field anymore
  if (cleaned.variableValues) {
    delete cleaned.variableValues;
  }

  // No longer returning hasNextPage/hasPreviousPage fields for discount applications at the root level
  // These fields existed at the root discount applications, but not at the discount application inside discount allocation level
  // These fields didn't return any actual information, since the values were always false (because we fetch the LIMIT number of discount applications).
  // There is therefore no point in modifying the code to accommodate the discrepancy between root level and line item level discount applications
  if (cleaned.hasNextPage != null) {
    delete cleaned.hasNextPage;
  }
  if (cleaned.hasPreviousPage != null) {
    delete cleaned.hasPreviousPage;
  }

  return cleaned;
}

function assertActualDiscountApplicationIsExpected(actual, expected) {
  // These two fields are different between cart and checkout, so we aren't comparing them below
  // but still want to assert that they exist
  assert.equal(actual.__typename, 'DiscountApplication');
  assert.equal(actual.type.name, 'DiscountApplication');
  assert.deepEqual(comparableDiscountApplication(actual), comparableDiscountApplication(expected));
}

function assertActualDiscountAllocationIsExpected(actual, expected) {
  assertAmountsEqual(actual.allocatedAmount.amount, expected.allocatedAmount.amount);
  assertActualDiscountApplicationIsExpected(actual.discountApplication, expected.discountApplication);

  // Create a deep copy to avoid modifying the original object
  const cleanedActualWithoutApplication = JSON.parse(JSON.stringify(actual));
  const cleanedExpectedWithoutApplication = JSON.parse(JSON.stringify(expected));

  // Allows us to compare all fields except those we already asserted above
  delete cleanedActualWithoutApplication.discountApplication;
  delete cleanedActualWithoutApplication.allocatedAmount;
  delete cleanedExpectedWithoutApplication.discountApplication;
  delete cleanedExpectedWithoutApplication.allocatedAmount;

  assert.deepEqual(cleanedActualWithoutApplication, cleanedExpectedWithoutApplication);
}

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

  const config = {
    storefrontAccessToken: '595005d0c565f6969eece280de85edb5',
    domain,
    apiVersion: 'unstable'
  };
  let client;

  setup(() => {
    client = Client.buildClient(config);
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

    suite('edge cases', () => {
      test('it gracefully handles a discount code that is not found', () => {
        const discountCode = 'NOTFOUND';

        return client.checkout.create({
          lineItems: [
            {
              variantId: 'gid://shopify/ProductVariant/50850334310456',
              quantity: 1
            }
          ]
        }).then((checkout) => {
          return client.checkout.addDiscount(checkout.id, discountCode).then((updatedCheckout) => {
            // In this case, the SF API doesn't return any user errors or throw an error
            assert.equal(updatedCheckout.discountApplications.length, 0);
            assert.equal(updatedCheckout.lineItems.length, 1);
          });
        });
      });

      test('it throws an error if the checkout ID is not valid', () => {
        return client.checkout.create({
          lineItems: [
            {
              variantId: 'gid://shopify/ProductVariant/50850334310456',
              quantity: 1
            }
          ]
        }).then(() => {
          return client.checkout.addDiscount('this is not a valid ID', 'DISCOUNT').catch((error) => {
            assert.ok(Boolean(error));
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
            assert.equal(updatedCheckout.discountApplications.length, 1);
            assert.equal(updatedCheckout.lineItems[0].discountAllocations.length, 1);

            const expectedRootDiscountApplications = [
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
            const expectedLineItemDiscountAllocations = [
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
            ];

            assert.equal(updatedCheckout.discountApplications.length, 1);
            assertActualDiscountApplicationIsExpected(updatedCheckout.discountApplications[0], expectedRootDiscountApplications[0]);
            assert.equal(updatedCheckout.lineItems.length, 1);
            assert.equal(updatedCheckout.lineItems[0].discountAllocations.length, 1);
            assertActualDiscountAllocationIsExpected(updatedCheckout.lineItems[0].discountAllocations[0], expectedLineItemDiscountAllocations[0]);
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

            assert.equal(updatedCheckout.discountApplications.length, 1);
            assertActualDiscountApplicationIsExpected(updatedCheckout.discountApplications[0], expectedRootDiscountApplications[0]);
            assert.equal(updatedCheckout.lineItems.length, 1);
            assert.equal(updatedCheckout.lineItems[0].discountAllocations.length, 1);
            assertActualDiscountAllocationIsExpected(updatedCheckout.lineItems[0].discountAllocations[0], expectedLineItemDiscountAllocations[0]);
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

            assert.equal(updatedCheckout.discountApplications.length, 1);
            assertActualDiscountApplicationIsExpected(updatedCheckout.discountApplications[0], expectedRootDiscountApplications[0]);
            assert.equal(updatedCheckout.lineItems.length, 1);
            assert.equal(updatedCheckout.lineItems[0].discountAllocations.length, 1);
            assertActualDiscountAllocationIsExpected(updatedCheckout.lineItems[0].discountAllocations[0], expectedLineItemDiscountAllocations[0]);
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
            assertActualDiscountApplicationIsExpected(updatedCheckout.discountApplications[0], expectedRootDiscountApplications[0]);
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

            assert.equal(updatedCheckout.discountApplications.length, 1);

            const expectedRootDiscountApplication = expectedRootDiscountApplications[0];
            const actualRootDiscountApplication = updatedCheckout.discountApplications[0];

            assertActualDiscountApplicationIsExpected(actualRootDiscountApplication, expectedRootDiscountApplication);
            assert.equal(updatedCheckout.lineItems.length, 2);
            assert.equal(updatedCheckout.lineItems[0].discountAllocations.length, 1);
            assert.equal(updatedCheckout.lineItems[1].discountAllocations.length, 1);
            assertActualDiscountAllocationIsExpected(updatedCheckout.lineItems[0].discountAllocations[0], expectedLineItemDiscountAllocations[0]);
            assertActualDiscountAllocationIsExpected(updatedCheckout.lineItems[1].discountAllocations[0], expectedLineItemDiscountAllocations[1]);
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

            assertActualDiscountApplicationIsExpected(actualRootDiscountApplication, expectedRootDiscountApplication);
            assert.equal(updatedCheckout.lineItems.length, 2);
            assert.equal(updatedCheckout.lineItems[0].discountAllocations.length, 1);
            assert.equal(updatedCheckout.lineItems[1].discountAllocations.length, 1);
            assertActualDiscountAllocationIsExpected(updatedCheckout.lineItems[0].discountAllocations[0], expectedLineItemDiscountAllocations[1]);
            assertActualDiscountAllocationIsExpected(updatedCheckout.lineItems[1].discountAllocations[0], expectedLineItemDiscountAllocations[0]);
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

            assertActualDiscountApplicationIsExpected(actualRootDiscountApplication, expectedRootDiscountApplication);
            assert.equal(updatedCheckout.lineItems.length, 2);
            assert.equal(updatedCheckout.lineItems[0].discountAllocations.length, 1);
            assert.equal(updatedCheckout.lineItems[1].discountAllocations.length, 1);
            assertActualDiscountAllocationIsExpected(updatedCheckout.lineItems[0].discountAllocations[0], expectedLineItemDiscountAllocations[1]);
            assertActualDiscountAllocationIsExpected(updatedCheckout.lineItems[1].discountAllocations[0], expectedLineItemDiscountAllocations[0]);
          });
        });
      });

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
                },
                type: {
                  fieldBaseTypes: {
                    allocatedAmount: 'MoneyV2',
                    discountApplication: 'DiscountApplication'
                  },
                  implementsNode: false,
                  kind: 'OBJECT',
                  name: 'DiscountAllocation'
                }
              }
            ];

            assert.equal(updatedCheckout.discountApplications.length, 1);

            const expectedRootDiscountApplication = expectedRootDiscountApplications[0];
            const actualRootDiscountApplication = updatedCheckout.discountApplications[0];

            assertActualDiscountApplicationIsExpected(actualRootDiscountApplication, expectedRootDiscountApplication);
            assert.equal(updatedCheckout.lineItems.length, 2);
            assert.equal(updatedCheckout.lineItems[0].discountAllocations.length, 1);
            assert.equal(updatedCheckout.lineItems[1].discountAllocations.length, 1);
            assertActualDiscountAllocationIsExpected(updatedCheckout.lineItems[0].discountAllocations[0], expectedLineItemDiscountAllocations[1]);
            assertActualDiscountAllocationIsExpected(updatedCheckout.lineItems[1].discountAllocations[0], expectedLineItemDiscountAllocations[0]);
          });
        });
      });
    });
  });

  suite('addDiscount / not supported', () => {
    suite('empty checkout', () => {
      // NOTE: We can't map this because updatedCheckout does not create a discountAllocation for the order-level discount on empty carts
      // all we have to work with is discountCodes: [ { "applicable": false, "code": "ORDERFIXED50OFF" } ]
      // Therefore we decided to just return an empty array for discountApplications
      test('it adds an order-level fixed amount discount to an empty checkout via addDiscount', () => {
        const discountCode = 'ORDERFIXED50OFF';

        return client.checkout.create({}).then((checkout) => {
          return client.checkout.addDiscount(checkout.id, discountCode).then((updatedCheckout) => {
            assert.equal(updatedCheckout.discountApplications.length, 0);
          });
        });
      });
    });

    test('it adds an order-level percentage discount to an empty checkout via addDiscount', () => {
      const discountCode = 'ORDER50PERCENTOFF';

      return client.checkout.create({}).then((checkout) => {
        return client.checkout.addDiscount(checkout.id, discountCode).then((updatedCheckout) => {
          assert.equal(updatedCheckout.discountApplications.length, 0);
        });
      });
    });
  });

  suite('removeDiscount', () => {});

});
