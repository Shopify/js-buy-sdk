/* eslint-disable id-length */
import assert from 'assert';
import Client from '../src/client';

// Helper function to compare currency amounts within 1 cent tolerance
function assertAmountsEqual(actual, expected, message) {
  const actualNum = parseFloat(actual);
  const expectedNum = parseFloat(expected);
  const diff = Math.abs(actualNum - expectedNum);

  assert.ok(
    diff <= 0.01,
    message || `Expected ${actual} to be within 0.01 of ${expected}`
  );
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
  assert.strictEqual(actual.__typename, 'DiscountApplication');
  assert.strictEqual(actual.type.name, 'DiscountApplication');
  assert.deepStrictEqual(
    comparableDiscountApplication(actual),
    comparableDiscountApplication(expected)
  );
}

function assertActualDiscountAllocationIsExpected(actual, expected) {
  assertAmountsEqual(
    actual.allocatedAmount.amount,
    expected.allocatedAmount.amount
  );
  assertActualDiscountApplicationIsExpected(
    actual.discountApplication,
    expected.discountApplication
  );

// Create a deep copy to avoid modifying the original object
  const cleanedActualWithoutApplication = JSON.parse(JSON.stringify(actual));
  const cleanedExpectedWithoutApplication = JSON.parse(
    JSON.stringify(expected)
  );

  // Allows us to compare all fields except those we already asserted above
  delete cleanedActualWithoutApplication.discountApplication;
  delete cleanedActualWithoutApplication.allocatedAmount;
  delete cleanedExpectedWithoutApplication.discountApplication;
  delete cleanedExpectedWithoutApplication.allocatedAmount;

  assert.deepStrictEqual(
    cleanedActualWithoutApplication,
    cleanedExpectedWithoutApplication
  );
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
    apiVersion: '2025-01'
  };
  let client;

  setup(() => {
    client = Client.buildClient(config);
  });

  teardown(() => {
    client = null;
  });

  suite('addDiscount', () => {
    suite('edge cases', () => {
      test('it gracefully handles a discount code that is not found', () => {
        const discountCode = 'NOTFOUND';

        return client.checkout
          .create({
            lineItems: [
              {
                variantId: 'gid://shopify/ProductVariant/50850334310456',
                quantity: 1
              }
            ]
          })
          .then((checkout) => {
            return client.checkout
              .addDiscount(checkout.id, discountCode)
              .then((updatedCheckout) => {
                // In this case, the SF API doesn't return any user errors or throw an error
                assert.strictEqual(
                  updatedCheckout.discountApplications.length,
                  0
                );
                assert.strictEqual(updatedCheckout.lineItems.length, 1);
              });
          });
      });

      test('it throws an error if the checkout ID is not valid', () => {
        return client.checkout
          .create({
            lineItems: [
              {
                variantId: 'gid://shopify/ProductVariant/50850334310456',
                quantity: 1
              }
            ]
          })
          .then(() => {
            return client.checkout
              .addDiscount('this is not a valid ID', 'DISCOUNT')
              .catch((error) => {
                assert.ok(Boolean(error));
              });
          });
      });
    });

    suite('checkout with a single line item', () => {
      test('it adds a fixed amount discount to a checkout with a single line item via addDiscount', () => {
        return client.checkout
          .create({
            lineItems: [
              {
                variantId: 'gid://shopify/ProductVariant/50850334310456',
                quantity: 1
              }
            ]
          })
          .then((checkout) => {
            return client.checkout
              .addDiscount(checkout.id, '10OFF')
              .then((updatedCheckout) => {
                assert.strictEqual(
                  updatedCheckout.discountApplications.length,
                  1
                );
                assert.strictEqual(
                  updatedCheckout.lineItems[0].discountAllocations.length,
                  1
                );

                // Add assertions for previously missing price fields
                assert.ok(
                  updatedCheckout.lineItemsSubtotalPrice,
                  'lineItemsSubtotalPrice exists'
                );
                assert.ok(
                  updatedCheckout.lineItemsSubtotalPrice.amount,
                  'lineItemsSubtotalPrice amount exists'
                );
                assert.ok(
                  updatedCheckout.lineItemsSubtotalPrice.currencyCode,
                  'lineItemsSubtotalPrice currencyCode exists'
                );

                assert.ok(
                  updatedCheckout.subtotalPrice,
                  'subtotalPrice exists'
                );
                assert.ok(
                  updatedCheckout.subtotalPriceV2,
                  'subtotalPriceV2 exists'
                );
                assert.strictEqual(
                  updatedCheckout.subtotalPrice.amount,
                  updatedCheckout.subtotalPriceV2.amount,
                  'subtotalPrice amount matches V2'
                );

                assert.ok(updatedCheckout.totalPrice, 'totalPrice exists');
                assert.ok(updatedCheckout.totalPriceV2, 'totalPriceV2 exists');
                // Total price should be less than original due to discount
                const totalPriceNum = parseFloat(
                  updatedCheckout.totalPrice.amount
                );
                const lineItemPrice = parseFloat(
                  updatedCheckout.lineItems[0].variant.price.amount
                );

                assert.ok(
                  totalPriceNum < lineItemPrice,
                  'totalPrice reflects discount'
                );

                assert.ok(updatedCheckout.totalTax, 'totalTax exists');
                assert.ok(updatedCheckout.totalTaxV2, 'totalTaxV2 exists');

                // Verify UNSUPPORTED_FIELDS maintain expected values with discounts applied
                assert.strictEqual(
                  updatedCheckout.completedAt,
                  null,
                  'completedAt is null'
                );
                assert.strictEqual(
                  updatedCheckout.order,
                  null,
                  'order is null'
                );
                assert.strictEqual(
                  updatedCheckout.orderStatusUrl,
                  null,
                  'orderStatusUrl is null'
                );
                assert.strictEqual(
                  updatedCheckout.ready,
                  false,
                  'ready is false'
                );
                assert.strictEqual(
                  updatedCheckout.requiresShipping,
                  true,
                  'requiresShipping is true'
                );
                assert.strictEqual(
                  updatedCheckout.shippingLine,
                  null,
                  'shippingLine is null'
                );
                assert.strictEqual(
                  updatedCheckout.taxExempt,
                  false,
                  'taxExempt is false'
                );
                assert.strictEqual(
                  updatedCheckout.taxesIncluded,
                  false,
                  'taxesIncluded is false'
                );

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
                      checkoutId:
                        'gid://shopify/Checkout/e780a1b5bffd6a9ef530f1718b854e4f?key=f06572e061a9cc7e3b73e9a235239f42',
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

                assert.strictEqual(
                  updatedCheckout.discountApplications.length,
                  1
                );
                assertActualDiscountApplicationIsExpected(
                  updatedCheckout.discountApplications[0],
                  expectedRootDiscountApplications[0]
                );
                assert.strictEqual(updatedCheckout.lineItems.length, 1);
                assert.strictEqual(
                  updatedCheckout.lineItems[0].discountAllocations.length,
                  1
                );
                assertActualDiscountAllocationIsExpected(
                  updatedCheckout.lineItems[0].discountAllocations[0],
                  expectedLineItemDiscountAllocations[0]
                );
              });
          });
      });

      test('it adds a fixed amount discount to a checkout with a single line item via addDiscount when the discount is inputted in lowercase but actual discount code is uppercase', () => {
        return client.checkout
          .create({
            lineItems: [
              {
                variantId: 'gid://shopify/ProductVariant/50850334310456',
                quantity: 1
              }
            ]
          })
          .then((checkout) => {
            return client.checkout
              .addDiscount(checkout.id, '10off')
              .then((updatedCheckout) => {
                assert.strictEqual(
                  updatedCheckout.discountApplications.length,
                  1
                );
                assert.strictEqual(
                  updatedCheckout.lineItems[0].discountAllocations.length,
                  1
                );

                // Add assertions for previously missing price fields
                assert.ok(
                  updatedCheckout.lineItemsSubtotalPrice,
                  'lineItemsSubtotalPrice exists'
                );
                assert.ok(
                  updatedCheckout.lineItemsSubtotalPrice.amount,
                  'lineItemsSubtotalPrice amount exists'
                );
                assert.ok(
                  updatedCheckout.lineItemsSubtotalPrice.currencyCode,
                  'lineItemsSubtotalPrice currencyCode exists'
                );

                assert.ok(
                  updatedCheckout.subtotalPrice,
                  'subtotalPrice exists'
                );
                assert.ok(
                  updatedCheckout.subtotalPriceV2,
                  'subtotalPriceV2 exists'
                );
                assert.strictEqual(
                  updatedCheckout.subtotalPrice.amount,
                  updatedCheckout.subtotalPriceV2.amount,
                  'subtotalPrice amount matches V2'
                );

                assert.ok(updatedCheckout.totalPrice, 'totalPrice exists');
                assert.ok(updatedCheckout.totalPriceV2, 'totalPriceV2 exists');
                // Total price should be less than original due to discount
                const totalPriceNum = parseFloat(
                  updatedCheckout.totalPrice.amount
                );
                const lineItemPrice = parseFloat(
                  updatedCheckout.lineItems[0].variant.price.amount
                );

                assert.ok(
                  totalPriceNum < lineItemPrice,
                  'totalPrice reflects discount'
                );

                assert.ok(updatedCheckout.totalTax, 'totalTax exists');
                assert.ok(updatedCheckout.totalTaxV2, 'totalTaxV2 exists');

                // Verify UNSUPPORTED_FIELDS maintain expected values with discounts applied
                assert.strictEqual(
                  updatedCheckout.completedAt,
                  null,
                  'completedAt is null'
                );
                assert.strictEqual(
                  updatedCheckout.order,
                  null,
                  'order is null'
                );
                assert.strictEqual(
                  updatedCheckout.orderStatusUrl,
                  null,
                  'orderStatusUrl is null'
                );
                assert.strictEqual(
                  updatedCheckout.ready,
                  false,
                  'ready is false'
                );
                assert.strictEqual(
                  updatedCheckout.requiresShipping,
                  true,
                  'requiresShipping is true'
                );
                assert.strictEqual(
                  updatedCheckout.shippingLine,
                  null,
                  'shippingLine is null'
                );
                assert.strictEqual(
                  updatedCheckout.taxExempt,
                  false,
                  'taxExempt is false'
                );
                assert.strictEqual(
                  updatedCheckout.taxesIncluded,
                  false,
                  'taxesIncluded is false'
                );

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
                      checkoutId:
                        'gid://shopify/Checkout/e780a1b5bffd6a9ef530f1718b854e4f?key=f06572e061a9cc7e3b73e9a235239f42',
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

                assert.strictEqual(
                  updatedCheckout.discountApplications.length,
                  1
                );
                assertActualDiscountApplicationIsExpected(
                  updatedCheckout.discountApplications[0],
                  expectedRootDiscountApplications[0]
                );
                assert.strictEqual(updatedCheckout.lineItems.length, 1);
                assert.strictEqual(
                  updatedCheckout.lineItems[0].discountAllocations.length,
                  1
                );
                assertActualDiscountAllocationIsExpected(
                  updatedCheckout.lineItems[0].discountAllocations[0],
                  expectedLineItemDiscountAllocations[0]
                );
              });
          });
      });

      test('it adds a percentage discount to a checkout with a single line item via addDiscount', () => {
        const discountCode = '10PERCENTOFF';

        return client.checkout
          .create({
            lineItems: [
              {
                variantId: 'gid://shopify/ProductVariant/50850334310456',
                quantity: 1
              }
            ]
          })
          .then((checkout) => {
            return client.checkout
              .addDiscount(checkout.id, discountCode)
              .then((updatedCheckout) => {
                assert.strictEqual(
                  updatedCheckout.discountApplications.length,
                  1
                );

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
                      checkoutId:
                        'gid://shopify/Checkout/8e0b563fe9cbed2f28578774a29b4384?key=05c177374a10f2d633fa055ead3c0a76',
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

                assert.strictEqual(
                  updatedCheckout.discountApplications.length,
                  1
                );
                assertActualDiscountApplicationIsExpected(
                  updatedCheckout.discountApplications[0],
                  expectedRootDiscountApplications[0]
                );
                assert.strictEqual(updatedCheckout.lineItems.length, 1);
                assert.strictEqual(
                  updatedCheckout.lineItems[0].discountAllocations.length,
                  1
                );
                assertActualDiscountAllocationIsExpected(
                  updatedCheckout.lineItems[0].discountAllocations[0],
                  expectedLineItemDiscountAllocations[0]
                );
              });
          });
      });

      test('it adds an order-level fixed amount discount to a checkout with a single line item via addDiscount', () => {
        const discountCode = 'ORDERFIXED50OFF';

        return client.checkout
          .create({
            lineItems: [
              {
                variantId: 'gid://shopify/ProductVariant/50850334310456',
                quantity: 1
              }
            ]
          })
          .then((checkout) => {
            return client.checkout
              .addDiscount(checkout.id, discountCode)
              .then((updatedCheckout) => {
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
                      checkoutId:
                        'gid://shopify/Checkout/0781db3a69dfb04f7b35ba3d5d284ec3?key=a48ed68f7ed154809d2aedc8ae579647',
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

                assert.strictEqual(
                  updatedCheckout.discountApplications.length,
                  1
                );
                assertActualDiscountApplicationIsExpected(
                  updatedCheckout.discountApplications[0],
                  expectedRootDiscountApplications[0]
                );
                assert.strictEqual(updatedCheckout.lineItems.length, 1);
                assert.strictEqual(
                  updatedCheckout.lineItems[0].discountAllocations.length,
                  1
                );
                assertActualDiscountAllocationIsExpected(
                  updatedCheckout.lineItems[0].discountAllocations[0],
                  expectedLineItemDiscountAllocations[0]
                );
              });
          });
      });

      test('it adds an order-level percentage discount to a checkout with a single line item via addDiscount', () => {
        const discountCode = 'ORDER50PERCENTOFF';

        return client.checkout
          .create({
            lineItems: [
              {
                variantId: 'gid://shopify/ProductVariant/50850334310456',
                quantity: 1
              }
            ]
          })
          .then((checkout) => {
            return client.checkout
              .addDiscount(checkout.id, discountCode)
              .then((updatedCheckout) => {
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
                      checkoutId:
                        'gid://shopify/Checkout/176e6acf15ea3953c077674bc695fa96?key=e252b32caa0c3ea0ff85c0c437853624',
                      discountCode: 'ORDER50PERCENTOFF'
                    }
                  }
                ];

                assert.strictEqual(
                  updatedCheckout.discountApplications.length,
                  1
                );
                assertActualDiscountApplicationIsExpected(
                  updatedCheckout.discountApplications[0],
                  expectedRootDiscountApplications[0]
                );

                assert.ok(
                  updatedCheckout.lineItemsSubtotalPrice,
                  'lineItemsSubtotalPrice exists'
                );
                assert.ok(
                  updatedCheckout.lineItemsSubtotalPrice.amount,
                  'lineItemsSubtotalPrice amount exists'
                );
                assert.ok(
                  updatedCheckout.lineItemsSubtotalPrice.currencyCode,
                  'lineItemsSubtotalPrice currencyCode exists'
                );

                assert.ok(
                  updatedCheckout.subtotalPrice,
                  'subtotalPrice exists'
                );
                assert.ok(
                  updatedCheckout.subtotalPriceV2,
                  'subtotalPriceV2 exists'
                );
                assert.strictEqual(
                  updatedCheckout.subtotalPrice.amount,
                  updatedCheckout.subtotalPriceV2.amount,
                  'subtotalPrice amount matches V2'
                );

                assert.ok(updatedCheckout.totalPrice, 'totalPrice exists');
                assert.ok(updatedCheckout.totalPriceV2, 'totalPriceV2 exists');
                // Total price should be less than original due to discount
                const totalPriceNum = parseFloat(
                  updatedCheckout.totalPrice.amount
                );
                const lineItemPrice = parseFloat(
                  updatedCheckout.lineItems[0].variant.price.amount
                );

                assert.ok(
                  totalPriceNum < lineItemPrice,
                  'totalPrice reflects discount'
                );

                assert.ok(updatedCheckout.totalTax, 'totalTax exists');
                assert.ok(updatedCheckout.totalTaxV2, 'totalTaxV2 exists');

                // Verify UNSUPPORTED_FIELDS maintain expected values with discounts applied
                assert.strictEqual(
                  updatedCheckout.completedAt,
                  null,
                  'completedAt is null'
                );
                assert.strictEqual(
                  updatedCheckout.order,
                  null,
                  'order is null'
                );
                assert.strictEqual(
                  updatedCheckout.orderStatusUrl,
                  null,
                  'orderStatusUrl is null'
                );
                assert.strictEqual(
                  updatedCheckout.ready,
                  false,
                  'ready is false'
                );
                assert.strictEqual(
                  updatedCheckout.requiresShipping,
                  true,
                  'requiresShipping is true'
                );
                assert.strictEqual(
                  updatedCheckout.shippingLine,
                  null,
                  'shippingLine is null'
                );
                assert.strictEqual(
                  updatedCheckout.taxExempt,
                  false,
                  'taxExempt is false'
                );
                assert.strictEqual(
                  updatedCheckout.taxesIncluded,
                  false,
                  'taxesIncluded is false'
                );
              });
          });
      });
    });

    suite('checkout with multiple line items', () => {
      test('adds a fixed amount discount to a checkout with multiple line items via addDiscount', () => {
        const discountCode = '10OFF';

        return client.checkout
          .create({
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
          })
          .then((checkout) => {
            return client.checkout
              .addDiscount(checkout.id, discountCode)
              .then((updatedCheckout) => {
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

                assert.strictEqual(
                  updatedCheckout.discountApplications.length,
                  1
                );

                const expectedRootDiscountApplication =
                  expectedRootDiscountApplications[0];
                const actualRootDiscountApplication =
                  updatedCheckout.discountApplications[0];

                assertActualDiscountApplicationIsExpected(
                  actualRootDiscountApplication,
                  expectedRootDiscountApplication
                );
                assert.strictEqual(updatedCheckout.lineItems.length, 2);
                assert.strictEqual(
                  updatedCheckout.lineItems[0].discountAllocations.length,
                  1
                );
                assert.strictEqual(
                  updatedCheckout.lineItems[1].discountAllocations.length,
                  1
                );
                assertActualDiscountAllocationIsExpected(
                  updatedCheckout.lineItems[0].discountAllocations[0],
                  expectedLineItemDiscountAllocations[0]
                );
                assertActualDiscountAllocationIsExpected(
                  updatedCheckout.lineItems[1].discountAllocations[0],
                  expectedLineItemDiscountAllocations[1]
                );
              });
          });
      }).timeout(5000);

      test('adds a percentage discount to a checkout with multiple line items via addDiscount', () => {
        const discountCode = '10PERCENTOFF';

        return client.checkout
          .create({
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
          })
          .then((checkout) => {
            return client.checkout
              .addDiscount(checkout.id, discountCode)
              .then((updatedCheckout) => {
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
                      checkoutId:
                        'gid://shopify/Checkout/4b9b57cf11987488c086d3c26cc25954?key=de0d5a40602aa1de106a0f696e705cff',
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

                assert.strictEqual(
                  updatedCheckout.discountApplications.length,
                  1
                );

                const expectedRootDiscountApplication =
                  expectedRootDiscountApplications[0];
                const actualRootDiscountApplication =
                  updatedCheckout.discountApplications[0];

                assertActualDiscountApplicationIsExpected(
                  actualRootDiscountApplication,
                  expectedRootDiscountApplication
                );
                assert.strictEqual(updatedCheckout.lineItems.length, 2);
                assert.strictEqual(
                  updatedCheckout.lineItems[0].discountAllocations.length,
                  1
                );
                assert.strictEqual(
                  updatedCheckout.lineItems[1].discountAllocations.length,
                  1
                );
                assertActualDiscountAllocationIsExpected(
                  updatedCheckout.lineItems[0].discountAllocations[0],
                  expectedLineItemDiscountAllocations[1]
                );
                assertActualDiscountAllocationIsExpected(
                  updatedCheckout.lineItems[1].discountAllocations[0],
                  expectedLineItemDiscountAllocations[0]
                );
              });
          });
      });

      test('adds an order-level fixed amount discount to a checkout with multiple line items via addDiscount', () => {
        const discountCode = 'ORDERFIXED50OFF';

        return client.checkout
          .create({
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
          })
          .then((checkout) => {
            return client.checkout
              .addDiscount(checkout.id, discountCode)
              .then((updatedCheckout) => {
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
                      checkoutId:
                        'gid://shopify/Checkout/b6de06fc6e622df31bc9adb0bb0638b8?key=aa2fa590da7be07d25124fc5606db474',
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

                assert.strictEqual(
                  updatedCheckout.discountApplications.length,
                  1
                );

                const expectedRootDiscountApplication =
                  expectedRootDiscountApplications[0];
                const actualRootDiscountApplication =
                  updatedCheckout.discountApplications[0];

                assertActualDiscountApplicationIsExpected(
                  actualRootDiscountApplication,
                  expectedRootDiscountApplication
                );
                assert.strictEqual(updatedCheckout.lineItems.length, 2);
                assert.strictEqual(
                  updatedCheckout.lineItems[0].discountAllocations.length,
                  1
                );
                assert.strictEqual(
                  updatedCheckout.lineItems[1].discountAllocations.length,
                  1
                );
                assertActualDiscountAllocationIsExpected(
                  updatedCheckout.lineItems[0].discountAllocations[0],
                  expectedLineItemDiscountAllocations[1]
                );
                assertActualDiscountAllocationIsExpected(
                  updatedCheckout.lineItems[1].discountAllocations[0],
                  expectedLineItemDiscountAllocations[0]
                );
              });
          });
      });

      test('adds an order-level percentage discount to a checkout with multiple line items via addDiscount', () => {
        const discountCode = 'ORDER50PERCENTOFF';

        return client.checkout
          .create({
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
          })
          .then((checkout) => {
            return client.checkout
              .addDiscount(checkout.id, discountCode)
              .then((updatedCheckout) => {
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
                      checkoutId:
                        'gid://shopify/Checkout/2a45b2a7497f72213129cd312e355395?key=3318f8152c39a5e5ef82c2e86f427ee6',
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
                        checkoutId:
                          'gid://shopify/Checkout/2a45b2a7497f72213129cd312e355395?key=3318f8152c39a5e5ef82c2e86f427ee6',
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

                assert.strictEqual(
                  updatedCheckout.discountApplications.length,
                  1
                );

                const expectedRootDiscountApplication =
                  expectedRootDiscountApplications[0];
                const actualRootDiscountApplication =
                  updatedCheckout.discountApplications[0];

                assertActualDiscountApplicationIsExpected(
                  actualRootDiscountApplication,
                  expectedRootDiscountApplication
                );
                assert.strictEqual(updatedCheckout.lineItems.length, 2);
                assert.strictEqual(
                  updatedCheckout.lineItems[0].discountAllocations.length,
                  1
                );
                assert.strictEqual(
                  updatedCheckout.lineItems[1].discountAllocations.length,
                  1
                );
                assertActualDiscountAllocationIsExpected(
                  updatedCheckout.lineItems[0].discountAllocations[0],
                  expectedLineItemDiscountAllocations[1]
                );
                assertActualDiscountAllocationIsExpected(
                  updatedCheckout.lineItems[1].discountAllocations[0],
                  expectedLineItemDiscountAllocations[0]
                );
              });
          });
      });

      test('it adds multiple discounts in one addDiscount transaction', () => {
        const discountCodes = ['10OFF', 'FREESHIPPINGALLCOUNTRIES'];

        return client.checkout.create({
          lineItems: [
            {
              variantId: 'gid://shopify/ProductVariant/50850334310456',
              quantity: 1
            }

          ],
          shippingAddress: {
            country: 'United States',
            province: 'New York'
          }
        }).then((checkout) => {
          return client.checkout.addDiscount(checkout.id, discountCodes).then((updatedCheckout) => {
            assert.strictEqual(
              updatedCheckout.discountApplications.length,
              2
            );
          });
        });
      });


      test('Adds multiple discounts in multiple transaction', () => {
        const discountCodeOne = '10OFF';
        const discountCodeTwo = 'FREESHIPPINGALLCOUNTRIES';

        return client.checkout.create({
          lineItems: [
            {
              variantId: 'gid://shopify/ProductVariant/50850334310456',
              quantity: 1
            }

          ],
          shippingAddress: {
            country: 'United States',
            province: 'New York'
          }
        }).then((checkout) => {
          return client.checkout.addDiscount(checkout.id, discountCodeOne).then((updatedCheckout) => {
            assert.strictEqual(
              updatedCheckout.discountApplications.length,
              1
            );

            return client.checkout.addDiscount(checkout.id, discountCodeTwo).then((updatedCheckoutTwo) => {
              assert.strictEqual(
                updatedCheckoutTwo.discountApplications.length,
                2
              );
            });
          });
        });
      }).timeout(5000);

      suite('addDiscount / not supported', () => {
        suite('empty checkout', () => {
          // NOTE: We can't map this because updatedCheckout does not create a discountAllocation for the order-level discount on empty carts
          // all we have to work with is discountCodes: [ { "applicable": false, "code": "ORDERFIXED50OFF" } ]
          // Therefore we decided to just return an empty array for discountApplications
          test('it adds an order-level fixed amount discount to an empty checkout via addDiscount', () => {
            const discountCode = 'ORDERFIXED50OFF';

            return client.checkout.create({}).then((checkout) => {
              return client.checkout
                .addDiscount(checkout.id, discountCode)
                .then((updatedCheckout) => {
                  assert.strictEqual(
                    updatedCheckout.discountApplications.length,
                    0
                  );
                });
            });
          });
        });

        test('it adds an order-level percentage discount to an empty checkout via addDiscount', () => {
          const discountCode = 'ORDER50PERCENTOFF';

          return client.checkout.create({}).then((checkout) => {
            return client.checkout
              .addDiscount(checkout.id, discountCode)
              .then((updatedCheckout) => {
                assert.strictEqual(updatedCheckout.discountApplications.length, 0);
              });
          });
        });
      });

      suite('removeDiscount', () => {
        test('it removes a discount from a checkout via removeDiscount', () => {
          const discountCode = '10OFF';

          return client.checkout
            .create({
              lineItems: [
                {
                  variantId: 'gid://shopify/ProductVariant/50850334310456',
                  quantity: 1
                }
              ]
            })
            .then((checkout) => {
              return client.checkout
                .addDiscount(checkout.id, discountCode)
                .then((checkoutWithDiscount) => {
                  return client.checkout
                    .removeDiscount(checkoutWithDiscount.id)
                    .then((checkoutWithoutDiscount) => {
                      assert.strictEqual(
                        checkoutWithoutDiscount.discountApplications.length,
                        0
                      );
                      assert.strictEqual(
                        checkoutWithoutDiscount.lineItems.length,
                        1
                      );
                      assert.strictEqual(
                        checkoutWithoutDiscount.lineItems[0].discountAllocations
                          .length,
                        0
                      );
                    });
                });
            });
        }).timeout(5000);

        test('it returns an error when the checkout ID is invalid', () => {
          const invalidCheckoutId = 'invalid-checkout-id';

          return client.checkout
            .removeDiscount(invalidCheckoutId)
            .catch((error) => {
              assert.ok(error.message.includes('invalid value'));
            });
        });
      });
    });

    suite('shipping discounts', () => {
      test('cannot return shipping discount information for a checkout without a shipping address and no line items', async() => {
        const discountCode = 'FREESHIPPINGALLCOUNTRIES';

        return client.checkout
          .create({})
          .then((checkout) => {
            return client.checkout
              .addDiscount(checkout.id, discountCode)
              .then((updatedCheckout) => {
                assert.strictEqual(
                  updatedCheckout.discountApplications.length,
                  0
                );
              });
          });
      }).timeout(5000);

      test('cannot return shipping discount information for a checkout without a shipping address and a single line item', () => {
        const discountCode = 'FREESHIPPINGALLCOUNTRIES';

        return client.checkout
          .create({
            lineItems: [
              {
                variantId: 'gid://shopify/ProductVariant/50850334310456',
                quantity: 1
              }
            ]
          })
          .then((checkout) => {
            return client.checkout
              .addDiscount(checkout.id, discountCode)
              .then((updatedCheckout) => {
                assert.strictEqual(
                  updatedCheckout.discountApplications.length,
                  0
                );

                assert.strictEqual(updatedCheckout.lineItems[0].discountAllocations.length, 0);
              });
          });
      }).timeout(5000);

      test('cannot return shipping discount information for a checkout without a shipping address and multiple line items', () => {
        const discountCode = 'FREESHIPPINGALLCOUNTRIES';

        return client.checkout
          .create({
            lineItems: [
              {
                variantId: 'gid://shopify/ProductVariant/50850334310456',
                quantity: 1
              }
            ]
          })
          .then((checkout) => {
            return client.checkout
              .addDiscount(checkout.id, discountCode)
              .then((updatedCheckout) => {
                assert.strictEqual(
                  updatedCheckout.discountApplications.length,
                  0
                );

                updatedCheckout.lineItems.forEach((lineItem) => {
                  assert.strictEqual(lineItem.discountAllocations.length, 0);
                });
              });
          });
      }).timeout(5000);

      test('cannot return shipping discount information but returns other discount information for a checkout without a shipping address and multiple line items', async() => {
        const discountCode1 = 'ORDERFIXED50OFF';
        const discountCode2 = 'FREESHIPPINGALLCOUNTRIES';
        const discountCode3 = '5OFFONCE';
        const discountCode4 = 'XGETY50OFF';


        const checkout = await client.checkout.create({
          lineItems: [
            {
              variantId: 'gid://shopify/ProductVariant/50850334310456',
              quantity: 5
            },
            {
              variantId: 'gid://shopify/ProductVariant/50850336211000',
              quantity: 10
            }
          ]
        });

        // eslint-disable-next-line newline-after-var
        let updatedCheckout = await client.checkout.addDiscount(checkout.id, discountCode1);
        updatedCheckout = await client.checkout.addDiscount(updatedCheckout.id, discountCode2);
        updatedCheckout = await client.checkout.addDiscount(updatedCheckout.id, discountCode3);
        updatedCheckout = await client.checkout.addDiscount(updatedCheckout.id, discountCode4);

        const expectedRootDiscountApplications = [
          {
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
              checkoutId:
                'gid://shopify/Checkout/64315a82d62b5d89481c462a43f3a896?key=a27df729b11a037e5b844dbd41750b41',
              discountCode: 'ORDERFIXED50OFF'
            }
          },
          {
            __typename: 'DiscountApplication',
            targetSelection: 'ENTITLED',
            allocationMethod: 'ACROSS',
            targetType: 'LINE_ITEM',
            value: {
              amount: '5.0',
              currencyCode: 'CAD',
              type: {
                name: 'PricingValue',
                kind: 'UNION'
              }
            },
            hasNextPage: false,
            hasPreviousPage: false,
            code: '5OFFONCE',
            applicable: true,
            type: {
              fieldBaseTypes: {
                applicable: 'Boolean',
                code: 'String'
              },
              implementsNode: false,
              kind: 'OBJECT',
              name: 'DiscountApplication'
            }
          },
          {
            targetSelection: 'ENTITLED',
            allocationMethod: 'EACH',
            targetType: 'LINE_ITEM',
            value: {
              amount: '350.0',
              currencyCode: 'CAD',
              type: {
                name: 'PricingValue',
                kind: 'UNION'
              }
            },
            code: 'XGETY50OFF',
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
              checkoutId:
              'gid://shopify/Checkout/64315a82d62b5d89481c462a43f3a896?key=a27df729b11a037e5b844dbd41750b41',
              discountCode: 'XGETY50OFF'
            }
          }
        ];

        assert.strictEqual(updatedCheckout.discountApplications.length, expectedRootDiscountApplications.length);
        // Just in case the relative order is different
        updatedCheckout.discountApplications.sort((a, b) => a.code.localeCompare(b.code));
        expectedRootDiscountApplications.sort((a, b) => a.code.localeCompare(b.code));
        updatedCheckout.discountApplications.forEach((discountApplication, index) => {
          assertActualDiscountApplicationIsExpected(
            discountApplication,
            expectedRootDiscountApplications[index]
          );
        });

        const actualAndExpectedDiscountAllocations = {
          // Keys are variant ID (without gid://shopify/ProductVariant/) and quantity
          // Even though we had only 2 line items as input, it is expected that we have 4 entries here due to the combination of the
          // "Buy X Get Y" discount and the fact that "5OFFONCE" is only applied once and not per item
          // This "line item splitting" behaviour is consistent between the Checkout API and the Cart API
          '50850334310456_1': {
            expected: [
              {
                allocatedAmount: {
                  amount: '5.0',
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
                  __typename: 'DiscountApplication',
                  targetSelection: 'ENTITLED',
                  allocationMethod: 'ACROSS',
                  targetType: 'LINE_ITEM',
                  value: {
                    amount: '5.0',
                    currencyCode: 'CAD',
                    type: {
                      name: 'PricingValue',
                      kind: 'UNION'
                    }
                  },
                  hasNextPage: false,
                  hasPreviousPage: false,
                  code: '5OFFONCE',
                  applicable: true,
                  type: {
                    fieldBaseTypes: {
                      applicable: 'Boolean',
                      code: 'String'
                    },
                    implementsNode: false,
                    kind: 'OBJECT',
                    name: 'DiscountApplication'
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
              },
              {
                // There is a small discrepancy between the Checkout API and the Cart API in this "line item splitting" scenario
                // For both APIs, we have 4 discount allocations for the "ORDERFIXED50OFF" order-level discount (and we have 4 line items after the "splitting")
                // For these 4 discount allocations (for the "ORDERFIXED50OFF" order-level discount):
                // - the Checkout API returns **2** discount allocations on 2 of the line items and **0** discount allocations on the other 2 line items
                // - the Cart API returns **1** discount allocation on each of the 4 line items
                //
                // With order-level discounts, the discount allocations sum up to the total discount amount, so either way the result is the same.
                // Here, the "expected" discount allocations are directly from the Checkout APIs EXCEPT I have manually moved 2 of the order-level discount allocations
                // so that each line item has 1 discount allocation (since ultimately we want this to represent what we expect JS Buy SDK v3 to return if everything
                // is working as expected)
                allocatedAmount: {
                  amount: '7.25',
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
                  __typename: 'DiscountApplication',
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
                  hasNextPage: false,
                  hasPreviousPage: false,
                  code: 'ORDERFIXED50OFF',
                  applicable: true,
                  type: {
                    fieldBaseTypes: {
                      applicable: 'Boolean',
                      code: 'String'
                    },
                    implementsNode: false,
                    kind: 'OBJECT',
                    name: 'DiscountApplication'
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
            ]
          },
          '50850334310456_4': {
            expected: [
              {
                allocatedAmount: {
                  amount: '29.74',
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
                  __typename: 'DiscountApplication',
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
                  hasNextPage: false,
                  hasPreviousPage: false,
                  code: 'ORDERFIXED50OFF',
                  applicable: true,
                  type: {
                    fieldBaseTypes: {
                      applicable: 'Boolean',
                      code: 'String'
                    },
                    implementsNode: false,
                    kind: 'OBJECT',
                    name: 'DiscountApplication'
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
              },
              {
                allocatedAmount: {
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
                },
                discountApplication: {
                  __typename: 'DiscountApplication',
                  targetSelection: 'ENTITLED',
                  allocationMethod: 'EACH',
                  targetType: 'LINE_ITEM',
                  value: {
                    amount: '350.0',
                    currencyCode: 'CAD',
                    type: {
                      name: 'PricingValue',
                      kind: 'UNION'
                    }
                  },
                  hasNextPage: false,
                  hasPreviousPage: false,
                  code: 'XGETY50OFF',
                  applicable: true,
                  type: {
                    fieldBaseTypes: {
                      applicable: 'Boolean',
                      code: 'String'
                    },
                    implementsNode: false,
                    kind: 'OBJECT',
                    name: 'DiscountApplication'
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
            ]
          },
          '50850336211000_3': {
            expected: [
              {
                allocatedAmount: {
                  amount: '7.8',
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
                  __typename: 'DiscountApplication',
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
                  hasNextPage: false,
                  hasPreviousPage: false,
                  code: 'ORDERFIXED50OFF',
                  applicable: true,
                  type: {
                    fieldBaseTypes: {
                      applicable: 'Boolean',
                      code: 'String'
                    },
                    implementsNode: false,
                    kind: 'OBJECT',
                    name: 'DiscountApplication'
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
              },
              {
                allocatedAmount: {
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
                },
                discountApplication: {
                  __typename: 'DiscountApplication',
                  targetSelection: 'ENTITLED',
                  allocationMethod: 'EACH',
                  targetType: 'LINE_ITEM',
                  value: {
                    amount: '350.0',
                    currencyCode: 'CAD',
                    type: {
                      name: 'PricingValue',
                      kind: 'UNION'
                    }
                  },
                  hasNextPage: false,
                  hasPreviousPage: false,
                  code: 'XGETY50OFF',
                  applicable: true,
                  type: {
                    fieldBaseTypes: {
                      applicable: 'Boolean',
                      code: 'String'
                    },
                    implementsNode: false,
                    kind: 'OBJECT',
                    name: 'DiscountApplication'
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
            ]
          },
          '50850336211000_7': {
            expected: [
              {
                allocatedAmount: {
                  amount: '5.21',
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
                  __typename: 'DiscountApplication',
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
                  hasNextPage: false,
                  hasPreviousPage: false,
                  code: 'ORDERFIXED50OFF',
                  applicable: true,
                  type: {
                    fieldBaseTypes: {
                      applicable: 'Boolean',
                      code: 'String'
                    },
                    implementsNode: false,
                    kind: 'OBJECT',
                    name: 'DiscountApplication'
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
              },
              {
                allocatedAmount: {
                  amount: '350.0',
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
                  __typename: 'DiscountApplication',
                  targetSelection: 'ENTITLED',
                  allocationMethod: 'EACH',
                  targetType: 'LINE_ITEM',
                  value: {
                    amount: '350.0',
                    currencyCode: 'CAD',
                    type: {
                      name: 'PricingValue',
                      kind: 'UNION'
                    }
                  },
                  hasNextPage: false,
                  hasPreviousPage: false,
                  code: 'XGETY50OFF',
                  applicable: true,
                  type: {
                    fieldBaseTypes: {
                      applicable: 'Boolean',
                      code: 'String'
                    },
                    implementsNode: false,
                    kind: 'OBJECT',
                    name: 'DiscountApplication'
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
            ]
          }
        };

        updatedCheckout.lineItems.forEach((line) => {
          // Remove the gid://shopify/ProductVariant/ prefix from the variant ID
          const variantId = line.variant.id.split('/').pop();
          const quantity = line.quantity;
          const actual = line.discountAllocations.sort((a, b) => a.discountApplication.code.localeCompare(b.discountApplication.code));
          const expected = actualAndExpectedDiscountAllocations[`${variantId}_${quantity}`].expected.sort((a, b) => a.discountApplication.code.localeCompare(b.discountApplication.code));

          assert.strictEqual(actual.length, expected.length);
          for (let i = 0; i < actual.length; i++) {
            assertActualDiscountAllocationIsExpected(actual[i], expected[i]);
          }
        });
      }).timeout(10000);

      test('gracefully returns an empty array for discountApplications when adding a free shipping discount to a checkout with a shipping address but no line items', async() => {
        const discountCode = 'FREESHIPPINGALLCOUNTRIES';

        const checkout = await client.checkout.create({
          shippingAddress: {
            country: 'United States',
            province: 'New York'
          }
        });

        const updatedCheckout = await client.checkout.addDiscount(checkout.id, discountCode);


        assert.strictEqual(updatedCheckout.discountApplications.length, 0);
      });

      test('adds a free shipping discount to a checkout with a shipping address and a single line item', async() => {
        const discountCode = 'FREESHIPPINGALLCOUNTRIES';

        const checkout = await client.checkout.create({
          lineItems: [
            {
              variantId: 'gid://shopify/ProductVariant/50850334310456',
              quantity: 1
            }
          ],
          shippingAddress: {
            country: 'United States',
            province: 'New York'
          }
        });

        const updatedCheckout = await client.checkout.addDiscount(checkout.id, discountCode);

        const expectedRootDiscountApplications = [
          {
            __typename: 'DiscountCodeApplication',
            targetSelection: 'ALL',
            allocationMethod: 'EACH',
            targetType: 'SHIPPING_LINE',
            value: {
              percentage: 100.0,
              type: {
                kind: 'UNION',
                name: 'PricingValue'
              }
            },
            code: 'FREESHIPPINGALLCOUNTRIES',
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
              checkoutId:
                'gid://shopify/Checkout/64315a82d62b5d89481c462a43f3a896?key=a27df729b11a037e5b844dbd41750b41',
              discountCode
            }
          }
        ];

        const expectedRootDiscountApplication = expectedRootDiscountApplications[0];
        const actualRootDiscountApplication = updatedCheckout.discountApplications[0];

        assertActualDiscountApplicationIsExpected(
          actualRootDiscountApplication,
          expectedRootDiscountApplication
        );
        assert.strictEqual(updatedCheckout.lineItems[0].discountAllocations.length, 0);
      }).timeout(5000);

      test('adds a free shipping discount to a checkout with a shipping address and multiple line items', async () => {
        const discountCode = 'FREESHIPPINGALLCOUNTRIES';

        const checkout = await client.checkout.create({
          lineItems: [
            {
              variantId: 'gid://shopify/ProductVariant/50850334310456',
              quantity: 2
            },
            {
              variantId: 'gid://shopify/ProductVariant/50850336211000',
              quantity: 3
            }
          ],
          shippingAddress: {
            country: 'United States',
            province: 'New York'
          }
        });

        const updatedCheckout = await client.checkout.addDiscount(
          checkout.id,
          discountCode
        );

        const expectedRootDiscountApplications = [
          {
            __typename: 'DiscountCodeApplication',
            targetSelection: 'ALL',
            allocationMethod: 'EACH',
            targetType: 'SHIPPING_LINE',
            value: {
              percentage: 100,
              type: {
                name: 'PricingValue',
                kind: 'UNION'
              }
            },
            code: discountCode,
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
              checkoutId:
                'gid://shopify/Checkout/64315a82d62b5d89481c462a43f3a896?key=a27df729b11a037e5b844dbd41750b41',
              discountCode
            }
          }
        ];

        assert.strictEqual(
          updatedCheckout.discountApplications.length,
          1
        );

        const expectedRootDiscountApplication =
          expectedRootDiscountApplications[0];
        const actualRootDiscountApplication =
          updatedCheckout.discountApplications[0];

        assertActualDiscountApplicationIsExpected(
          actualRootDiscountApplication,
          expectedRootDiscountApplication
        );

        updatedCheckout.lineItems.forEach((lineItem) => {
          assert.strictEqual(lineItem.discountAllocations.length, 0);
        });
      }).timeout(5000);

      test('returns shipping discount and other discount information for a checkout with a shipping address and multiple line items', async() => {
        const discountCode1 = 'ORDERFIXED50OFF';
        const discountCode2 = 'FREESHIPPINGALLCOUNTRIES';
        const discountCode3 = '5OFFONCE';
        const discountCode4 = 'XGETY50OFF';


        const checkout = await client.checkout.create({
          lineItems: [
            {
              variantId: 'gid://shopify/ProductVariant/50850334310456',
              quantity: 5
            },
            {
              variantId: 'gid://shopify/ProductVariant/50850336211000',
              quantity: 10
            }
          ],
          shippingAddress: {
            country: 'United States',
            province: 'New York'
          }
        });

        // eslint-disable-next-line newline-after-var
        let updatedCheckout = await client.checkout.addDiscount(checkout.id, discountCode1);
        updatedCheckout = await client.checkout.addDiscount(updatedCheckout.id, discountCode2);
        updatedCheckout = await client.checkout.addDiscount(updatedCheckout.id, discountCode3);
        updatedCheckout = await client.checkout.addDiscount(updatedCheckout.id, discountCode4);

        const expectedRootDiscountApplications = [
          {
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
              checkoutId:
                'gid://shopify/Checkout/64315a82d62b5d89481c462a43f3a896?key=a27df729b11a037e5b844dbd41750b41',
              discountCode: 'ORDERFIXED50OFF'
            }
          },
          {
            __typename: 'DiscountApplication',
            targetSelection: 'ENTITLED',
            allocationMethod: 'ACROSS',
            targetType: 'LINE_ITEM',
            value: {
              amount: '5.0',
              currencyCode: 'CAD',
              type: {
                name: 'PricingValue',
                kind: 'UNION'
              }
            },
            hasNextPage: false,
            hasPreviousPage: false,
            code: '5OFFONCE',
            applicable: true,
            type: {
              fieldBaseTypes: {
                applicable: 'Boolean',
                code: 'String'
              },
              implementsNode: false,
              kind: 'OBJECT',
              name: 'DiscountApplication'
            }
          },
          {
            targetSelection: 'ENTITLED',
            allocationMethod: 'EACH',
            targetType: 'LINE_ITEM',
            value: {
              amount: '350.0',
              currencyCode: 'CAD',
              type: {
                name: 'PricingValue',
                kind: 'UNION'
              }
            },
            code: 'XGETY50OFF',
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
              checkoutId:
              'gid://shopify/Checkout/64315a82d62b5d89481c462a43f3a896?key=a27df729b11a037e5b844dbd41750b41',
              discountCode: 'XGETY50OFF'
            }
          },
          {
            targetSelection: 'ALL',
            allocationMethod: 'EACH',
            targetType: 'SHIPPING_LINE',
            value: {
              percentage: 100.0,
              type: {
                name: 'PricingValue',
                kind: 'UNION'
              }
            },
            code: 'FREESHIPPINGALLCOUNTRIES',
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
              checkoutId:
              'gid://shopify/Checkout/64315a82d62b5d89481c462a43f3a896?key=a27df729b11a037e5b844dbd41750b41',
              discountCode: 'FREESHIPPINGALLCOUNTRIES'
            }
          }
        ];

        assert.strictEqual(updatedCheckout.discountApplications.length, expectedRootDiscountApplications.length);
        // Just in case the relative order is different
        updatedCheckout.discountApplications.sort((a, b) => a.code.localeCompare(b.code));
        expectedRootDiscountApplications.sort((a, b) => a.code.localeCompare(b.code));
        updatedCheckout.discountApplications.forEach((discountApplication, index) => {
          assertActualDiscountApplicationIsExpected(
            discountApplication,
            expectedRootDiscountApplications[index]
          );
        });

        const actualAndExpectedDiscountAllocations = {
          // Keys are variant ID (without gid://shopify/ProductVariant/) and quantity
          // Even though we had only 2 line items as input, it is expected that we have 4 entries here due to the combination of the
          // "Buy X Get Y" discount and the fact that "5OFFONCE" is only applied once and not per item
          // This "line item splitting" behaviour is consistent between the Checkout API and the Cart API
          '50850334310456_1': {
            expected: [
              {
                allocatedAmount: {
                  amount: '5.0',
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
                  __typename: 'DiscountApplication',
                  targetSelection: 'ENTITLED',
                  allocationMethod: 'ACROSS',
                  targetType: 'LINE_ITEM',
                  value: {
                    amount: '5.0',
                    currencyCode: 'CAD',
                    type: {
                      name: 'PricingValue',
                      kind: 'UNION'
                    }
                  },
                  hasNextPage: false,
                  hasPreviousPage: false,
                  code: '5OFFONCE',
                  applicable: true,
                  type: {
                    fieldBaseTypes: {
                      applicable: 'Boolean',
                      code: 'String'
                    },
                    implementsNode: false,
                    kind: 'OBJECT',
                    name: 'DiscountApplication'
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
              },
              {
                allocatedAmount: {
                  amount: '7.25',
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
                  __typename: 'DiscountApplication',
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
                  hasNextPage: false,
                  hasPreviousPage: false,
                  code: 'ORDERFIXED50OFF',
                  applicable: true,
                  type: {
                    fieldBaseTypes: {
                      applicable: 'Boolean',
                      code: 'String'
                    },
                    implementsNode: false,
                    kind: 'OBJECT',
                    name: 'DiscountApplication'
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
            ]
          },
          '50850334310456_4': {
            expected: [
              {
                // There is a small discrepancy between the Checkout API and the Cart API in this "line item splitting" scenario
                // For both APIs, we have 4 discount allocations for the "ORDERFIXED50OFF" order-level discount (and we have 4 line items after the "splitting")
                // For these 4 discount allocations (for the "ORDERFIXED50OFF" order-level discount):
                // - the Checkout API returns **2** discount allocations on 2 of the line items and **0** discount allocations on the other 2 line items
                // - the Cart API returns **1** discount allocation on each of the 4 line items
                //
                // With order-level discounts, the discount allocations sum up to the total discount amount, so either way the result is the same.
                // Here, the "expected" discount allocations are directly from the Checkout APIs EXCEPT I have manually adjusted the order-level discount allocations
                // so that each line item has 1 discount allocation (since ultimately we want this to represent what we expect JS Buy SDK v3 to return if everything
                // is working as expected)
                allocatedAmount: {
                  amount: '29.74',
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
                  __typename: 'DiscountApplication',
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
                  hasNextPage: false,
                  hasPreviousPage: false,
                  code: 'ORDERFIXED50OFF',
                  applicable: true,
                  type: {
                    fieldBaseTypes: {
                      applicable: 'Boolean',
                      code: 'String'
                    },
                    implementsNode: false,
                    kind: 'OBJECT',
                    name: 'DiscountApplication'
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
              },
              {
                allocatedAmount: {
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
                },
                discountApplication: {
                  __typename: 'DiscountApplication',
                  targetSelection: 'ENTITLED',
                  allocationMethod: 'EACH',
                  targetType: 'LINE_ITEM',
                  value: {
                    amount: '350.0',
                    currencyCode: 'CAD',
                    type: {
                      name: 'PricingValue',
                      kind: 'UNION'
                    }
                  },
                  hasNextPage: false,
                  hasPreviousPage: false,
                  code: 'XGETY50OFF',
                  applicable: true,
                  type: {
                    fieldBaseTypes: {
                      applicable: 'Boolean',
                      code: 'String'
                    },
                    implementsNode: false,
                    kind: 'OBJECT',
                    name: 'DiscountApplication'
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
            ]
          },
          '50850336211000_3': {
            expected: [
              {
                allocatedAmount: {
                  amount: '7.8',
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
                  __typename: 'DiscountApplication',
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
                  hasNextPage: false,
                  hasPreviousPage: false,
                  code: 'ORDERFIXED50OFF',
                  applicable: true,
                  type: {
                    fieldBaseTypes: {
                      applicable: 'Boolean',
                      code: 'String'
                    },
                    implementsNode: false,
                    kind: 'OBJECT',
                    name: 'DiscountApplication'
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
              },
              {
                allocatedAmount: {
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
                },
                discountApplication: {
                  __typename: 'DiscountApplication',
                  targetSelection: 'ENTITLED',
                  allocationMethod: 'EACH',
                  targetType: 'LINE_ITEM',
                  value: {
                    amount: '350.0',
                    currencyCode: 'CAD',
                    type: {
                      name: 'PricingValue',
                      kind: 'UNION'
                    }
                  },
                  hasNextPage: false,
                  hasPreviousPage: false,
                  code: 'XGETY50OFF',
                  applicable: true,
                  type: {
                    fieldBaseTypes: {
                      applicable: 'Boolean',
                      code: 'String'
                    },
                    implementsNode: false,
                    kind: 'OBJECT',
                    name: 'DiscountApplication'
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
            ]
          },
          '50850336211000_7': {
            expected: [
              {
                allocatedAmount: {
                  amount: '5.21',
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
                  __typename: 'DiscountApplication',
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
                  hasNextPage: false,
                  hasPreviousPage: false,
                  code: 'ORDERFIXED50OFF',
                  applicable: true,
                  type: {
                    fieldBaseTypes: {
                      applicable: 'Boolean',
                      code: 'String'
                    },
                    implementsNode: false,
                    kind: 'OBJECT',
                    name: 'DiscountApplication'
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
              },
              {
                allocatedAmount: {
                  amount: '350.0',
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
                  __typename: 'DiscountApplication',
                  targetSelection: 'ENTITLED',
                  allocationMethod: 'EACH',
                  targetType: 'LINE_ITEM',
                  value: {
                    amount: '350.0',
                    currencyCode: 'CAD',
                    type: {
                      name: 'PricingValue',
                      kind: 'UNION'
                    }
                  },
                  hasNextPage: false,
                  hasPreviousPage: false,
                  code: 'XGETY50OFF',
                  applicable: true,
                  type: {
                    fieldBaseTypes: {
                      applicable: 'Boolean',
                      code: 'String'
                    },
                    implementsNode: false,
                    kind: 'OBJECT',
                    name: 'DiscountApplication'
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
            ]
          }
        };

        updatedCheckout.lineItems.forEach((line) => {
          // Remove the gid://shopify/ProductVariant/ prefix from the variant ID
          const variantId = line.variant.id.split('/').pop();
          const quantity = line.quantity;
          const actual = line.discountAllocations.sort((a, b) => a.discountApplication.code.localeCompare(b.discountApplication.code));
          const expected = actualAndExpectedDiscountAllocations[`${variantId}_${quantity}`].expected.sort((a, b) => a.discountApplication.code.localeCompare(b.discountApplication.code));

          assert.strictEqual(actual.length, expected.length);
          for (let i = 0; i < actual.length; i++) {
            assertActualDiscountAllocationIsExpected(actual[i], expected[i]);
          }
        });
      }).timeout(10000);
    });
  });
});
