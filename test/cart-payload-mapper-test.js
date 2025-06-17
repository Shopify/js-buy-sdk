import assert from 'assert';
import {mapCartPayload} from '../src/cart-payload-mapper';
import {
  MOCK_CART_ATTRIBUTES,
  MOCK_CART_COST,
  MOCK_DATE,
  MOCK_10_CAD_GIFT_CARD,
  MOCK_15_USD_GIFT_CARD,
  MOCK_CHECKOUT_LINE_ITEMS,
  MOCK_CART_LINE_ITEMS
} from '../fixtures/cart-payload-mapper-fixture';
import {withType} from './cart-payload-mapper-test-utilities';

suite('cart-payload-mapper-test', () => {
  suite('appliedGiftCards', () => {
    test('it returns applied gift cards from cart', () => {
      const cart = {
        appliedGiftCards: [MOCK_10_CAD_GIFT_CARD, MOCK_15_USD_GIFT_CARD]
      };

      const result = mapCartPayload(cart);

      assert.deepStrictEqual(result.appliedGiftCards, cart.appliedGiftCards);
    });

    test('it returns empty array when there are no applied gift cards', () => {
      const cart = {appliedGiftCards: []};
      const result = mapCartPayload(cart);

      assert.deepStrictEqual(result.appliedGiftCards, []);
    });
  });

  suite('completedAt', () => {
    test('it returns null', () => {
      const cart = {};
      const result = mapCartPayload(cart);

      assert.strictEqual(result.completedAt, null);
    });
  });

  suite('createdAt', () => {
    test('it returns cart created at date', () => {
      const cart = {
        createdAt: MOCK_DATE
      };

      const result = mapCartPayload(cart);

      assert.strictEqual(result.createdAt, cart.createdAt);
    });
  });

  suite('id', () => {
    test('it returns a cart ID', () => {
      const cart = {
        id: 'gid://shopify/Cart/Z2NwLXVzLWNlbnRyYWwxOjAxSkNFV1ROLkZORzJZOUg5V1gwWTI1RDRL?key=d4438ff09137256a69a03e246c531b87'
      };

      const result = mapCartPayload(cart);

      assert.strictEqual(result.id, cart.id);
    });
  });

  suite('currencyCode', () => {
    test("it returns currency code from cart's total amount", () => {
      const costWithMultipleCurrencyCodes = {
        checkoutChargeAmount: Object.assign({}, MOCK_CART_COST.checkoutChargeAmount, {
          currencyCode: 'CAD'
        }),
        subtotalAmount: Object.assign({}, MOCK_CART_COST.subtotalAmount, {
          currencyCode: 'AUD'
        }),
        totalAmount: Object.assign({}, MOCK_CART_COST.totalAmount, {
          currencyCode: 'KRW'
        })
      };

      const cart = {
        cost: costWithMultipleCurrencyCodes
      };
      const result = mapCartPayload(cart);

      assert.strictEqual(result.currencyCode, cart.cost.totalAmount.currencyCode);
    });
  });

  suite('customAttributes', () => {
    test('it returns cart attributes', () => {
      const cart = {
        attributes: MOCK_CART_ATTRIBUTES
      };

      const result = mapCartPayload(cart);

      assert.deepStrictEqual(result.customAttributes, cart.attributes);
    });
  });

  suite('email', () => {
    test('it returns email from buyer identity', () => {
      const cart = {
        buyerIdentity: {
          email: 'test@example.com'
        }
      };

      const result = mapCartPayload(cart);

      assert.strictEqual(result.email, cart.buyerIdentity.email);
    });

    test('returns null when there is no buyer identity', () => {
      const cart = {};
      const result = mapCartPayload(cart);

      assert.strictEqual(result.email, null);
    });

    test('returns null when email is an empty string', () => {
      const cart = {
        buyerIdentity: {
          email: ''
        }
      };
      const result = mapCartPayload(cart);

      assert.strictEqual(result.email, null);
    });

    test('returns null when there is no email', () => {
      const cart = {
        buyerIdentity: {}
      };
      const result = mapCartPayload(cart);

      assert.strictEqual(result.email, null);
    });
  });

  suite('lineItems', () => {
    test('it returns empty array when no lines', () => {
      const cart = {
        lineItems: null
      };

      const result = mapCartPayload(cart);

      assert.deepStrictEqual(result.lineItems, []);
    });

    test('it returns line items from cart', () => {
      const cart = {
        lines: MOCK_CART_LINE_ITEMS,
        discountCodes: [],
        discountAllocations: []
      };

      const result = mapCartPayload(cart);
      const allExpectedFields = [
        'customAttributes',
        'discountAllocations',
        'id',
        'quantity',
        'title',
        'variant',
        'type',
        'hasNextPage',
        'hasPreviousPage',
        'variableValues'
      ];

      assert.equal(result.lineItems.length, MOCK_CART_LINE_ITEMS.length);
      result.lineItems.forEach((lineItem, index) => {
        assert.deepStrictEqual(Object.keys(lineItem).sort(), allExpectedFields.sort());

        // Properties we add on manually
        assert.deepStrictEqual(lineItem.type, {
          name: 'CheckoutLineItem',
          kind: 'OBJECT',
          fieldBaseTypes: {
            customAttributes: 'Attribute',
            discountAllocations: 'Object[]',
            id: 'ID',
            quantity: 'Int',
            title: 'String',
            variant: 'Merchandise'
          },
          implementsNode: true
        });
        assert.deepStrictEqual(lineItem.variant.type, {
          name: 'ProductVariant',
          kind: 'OBJECT',
          fieldBaseTypes: {
            availableForSale: 'Boolean',
            compareAtPrice: 'MoneyV2',
            id: 'ID',
            image: 'Image',
            price: 'MoneyV2',
            product: 'Product',
            selectedOptions: 'SelectedOption',
            sku: 'String',
            title: 'String',
            unitPrice: 'MoneyV2',
            unitPriceMeasurement: 'UnitPriceMeasurement',
            weight: 'Float'
          },
          implementsNode: true
        });

        // Properties we preserve as is from cart
        assert.deepStrictEqual(lineItem.id, MOCK_CART_LINE_ITEMS[index].id);
        assert.deepStrictEqual(lineItem.hasNextPage, MOCK_CART_LINE_ITEMS[index].hasNextPage);
        assert.deepStrictEqual(lineItem.hasPreviousPage, MOCK_CART_LINE_ITEMS[index].hasPreviousPage);
        assert.deepStrictEqual(lineItem.variableValues, MOCK_CART_LINE_ITEMS[index].variableValues);

        // Properties we map from cart to checkout
        assert.deepStrictEqual(lineItem.customAttributes, MOCK_CHECKOUT_LINE_ITEMS[index].customAttributes);
        assert.deepStrictEqual(lineItem.discountAllocations, MOCK_CHECKOUT_LINE_ITEMS[index].discountAllocations);
        assert.deepStrictEqual(lineItem.quantity, MOCK_CHECKOUT_LINE_ITEMS[index].quantity);
        assert.deepStrictEqual(lineItem.title, MOCK_CHECKOUT_LINE_ITEMS[index].title);
        assert.deepStrictEqual(lineItem.variant, MOCK_CHECKOUT_LINE_ITEMS[index].variant);
      });
    });
  });

  suite('lineItemsSubtotalPrice', () => {
    test('it returns checkout charge amount', () => {
      const cart = {
        cost: MOCK_CART_COST
      };

      const result = mapCartPayload(cart);

      assert.deepStrictEqual(result.lineItemsSubtotalPrice, cart.cost.checkoutChargeAmount);
    });
  });

  suite('note', () => {
    test('it returns cart note', () => {
      const cart = {
        note: 'Test note'
      };

      const result = mapCartPayload(cart);

      assert.strictEqual(result.note, cart.note);
    });
  });

  suite('order', () => {
    test('it returns null', () => {
      const cart = {};
      const result = mapCartPayload(cart);

      assert.strictEqual(result.order, null);
    });
  });

  suite('orderStatusUrl', () => {
    test('it returns null', () => {
      const cart = {};
      const result = mapCartPayload(cart);

      assert.strictEqual(result.orderStatusUrl, null);
    });
  });

  suite('paymentDue', () => {
    test("it returns cart's total amount", () => {
      const cart = {
        cost: MOCK_CART_COST
      };

      const result = mapCartPayload(cart);

      assert.deepStrictEqual(result.paymentDue, cart.cost.totalAmount);
    });
  });

  suite('ready', () => {
    test('it returns false', () => {
      const cart = {};
      const result = mapCartPayload(cart);

      assert.strictEqual(result.ready, false);
    });
  });

  suite('requiresShipping', () => {
    test('it returns null', () => {
      const cart = {};
      const result = mapCartPayload(cart);

      assert.strictEqual(result.requiresShipping, true);
    });
  });

  suite('shippingAddress', () => {
    test('it returns first delivery address preference', () => {
      const addresses = [{address1: '123 Main St'}, {address1: '456 Main St'}];
      const cart = {
        buyerIdentity: {
          deliveryAddressPreferences: addresses
        }
      };

      const result = mapCartPayload(cart);

      assert.strictEqual(result.shippingAddress, addresses[0]);
    });

    test('returns null when there is no buyer identity', () => {
      const cart = {};
      const result = mapCartPayload(cart);

      assert.strictEqual(result.shippingAddress, null);
    });

    test('returns null when there are no delivery address preferences', () => {
      const cart = {
        buyerIdentity: {
          deliveryAddressPreferences: []
        }
      };

      const result = mapCartPayload(cart);

      assert.strictEqual(result.shippingAddress, null);
    });
  });

  suite('shippingLine', () => {
    test('it returns null', () => {
      const cart = {};
      const result = mapCartPayload(cart);

      assert.strictEqual(result.shippingLine, null);
    });
  });

  suite('subtotalPrice', () => {
    test("when there are no gift cards, it returns cart's total amount with duties and taxes subtracted", () => {
      const cart = {
        cost: MOCK_CART_COST
      };

      const result = mapCartPayload(cart);

      assert.deepStrictEqual(result.subtotalPrice, withType({
        amount: '292.0',
        currencyCode: 'USD'
      }, 'MoneyV2'));
    });

    test("it returns cart's total amount with gift cards, duties, and taxes subtracted", () => {
      const cart = {
        cost: MOCK_CART_COST,
        appliedGiftCards: [MOCK_10_CAD_GIFT_CARD, MOCK_15_USD_GIFT_CARD]
      };

      const result = mapCartPayload(cart);

      assert.deepStrictEqual(result.subtotalPrice, withType({
        amount: '314.18',
        currencyCode: 'USD'
      }, 'MoneyV2'));
    });

    test("returns cart's total amount when there are no duties, taxes, or gift cards", () => {
      const costWithNoDutiesAndTax = Object.assign({}, MOCK_CART_COST, {totalTaxAmount: null, totalDutyAmount: null});
      const cart = {
        cost: costWithNoDutiesAndTax
      };

      const result = mapCartPayload(cart);

      assert.deepStrictEqual(result.subtotalPrice, withType({
        amount: '317.0',
        currencyCode: 'USD'
      }, 'MoneyV2'));
    });
  });

  suite('taxExempt', () => {
    test('it returns false', () => {
      const cart = {};
      const result = mapCartPayload(cart);

      assert.strictEqual(result.taxExempt, false);
    });
  });

  suite('taxesIncluded', () => {
    test('it returns false', () => {
      const cart = {};
      const result = mapCartPayload(cart);

      assert.strictEqual(result.taxesIncluded, false);
    });
  });

  suite('totalPrice', () => {
    test("returns cart's total cost when there are no applied gift cards", () => {
      const cart = {
        cost: MOCK_CART_COST,
        appliedGiftCards: []
      };

      const result = mapCartPayload(cart);

      assert.deepStrictEqual(result.totalPrice, cart.cost.totalAmount);
    });

    test("returns cart's total cost minus applied gift cards", () => {
      const cart = {
        cost: MOCK_CART_COST,
        appliedGiftCards: [MOCK_10_CAD_GIFT_CARD, MOCK_15_USD_GIFT_CARD]
      };

      const result = mapCartPayload(cart);

      assert.deepStrictEqual(
        result.totalPrice,
        withType({
          amount: '339.18',
          currencyCode: 'USD'
        }, 'MoneyV2')
      );
    });
  });

  suite('totalTax', () => {
    test("it returns cart's total tax amount", () => {
      const cart = {
        cost: MOCK_CART_COST
      };

      const result = mapCartPayload(cart);

      assert.deepStrictEqual(result.totalTax, cart.cost.totalTaxAmount);
    });

    test('returns a value of zero when there is no total tax amount', () => {
      const costWithNoTax = Object.assign({}, MOCK_CART_COST, {totalTaxAmount: null});
      const cart = {
        cost: costWithNoTax
      };

      const result = mapCartPayload(cart);

      assert.deepStrictEqual(result.totalTax, withType({
        amount: '0.0',
        currencyCode: 'USD'
      }, 'MoneyV2'));
    });
  });

  suite('updatedAt', () => {
    test('it returns cart updated at date', () => {
      const cart = {
        updatedAt: MOCK_DATE
      };

      const result = mapCartPayload(cart);

      assert.strictEqual(result.updatedAt, cart.updatedAt);
    });
  });

  suite('webUrl', () => {
    test('it returns checkout URL, with _fd=0 appended if not present', () => {
      const cart = {
        checkoutUrl: 'https://shop.com/checkout'
      };

      const result = mapCartPayload(cart);

      assert.strictEqual(result.webUrl, `${cart.checkoutUrl}?_fd=0`);
    });

    test('it gracefully handles invalid URLs by returning them unchanged', () => {
      const cart = {
        checkoutUrl: 'invalid'
      };

      const result = mapCartPayload(cart);

      assert.strictEqual(result.webUrl, cart.checkoutUrl);
    });

    test('it does not duplicate the query param _fd=0 if it is already present', () => {
      const cart = {
        checkoutUrl: 'https://shop.com/checkout?_fd=0'
      };

      const result = mapCartPayload(cart);

      assert.strictEqual(result.webUrl, cart.checkoutUrl);
    });

    test('it updates the value of _fd to 0 if it is present but with a different value', () => {
      const cart = {
        checkoutUrl: 'https://shop.com/checkout?_fd=1'
      };

      const result = mapCartPayload(cart);

      assert.strictEqual(result.webUrl, 'https://shop.com/checkout?_fd=0');
    });

    test('it adds _fd=0 while preserving other query params', () => {
      const cart = {
        checkoutUrl: 'https://shop.com/checkout?foo=bar&baz=qux'
      };

      const result = mapCartPayload(cart);

      assert.strictEqual(result.webUrl, 'https://shop.com/checkout?foo=bar&baz=qux&_fd=0');
    });

    test('it returns the original URL unchanged if it contains a _fd=0 query param along with other query params', () => {
      const cart = {
        checkoutUrl: 'https://shop.com/checkout?foo=bar&_fd=0&baz=qux'
      };

      const result = mapCartPayload(cart);

      assert.strictEqual(result.webUrl, cart.checkoutUrl);
    });
  });

  suite('discount error handling', () => {
    test('it returns empty discount applications and preserves line items when discount mapping fails', () => {
      // Mock console.error to capture output
      // eslint-disable-next-line no-console
      const originalConsoleError = console.error;
      const consoleErrors = [];

      // eslint-disable-next-line no-console
      console.error = (...args) => {
        consoleErrors.push(args);
      };

      // Cart with discount allocation that will trigger error (1 allocation for 2 line items)
      // This has been reported in a scenario where a discount was applied at checkout via a script, but the user navigated back to the
      // store (without completing checkout) and JS Buy SDK v3 was erroring when attempting to map the new cart payload
      // We are going to continue investigating to fix the root cause, but aborting discount mapping in this scenario as a temporary fix
      // is a better user experience in the meantime
      const cart = {
        lines: [
          {
            id: 'line1',
            merchandise: {
              product: {id: 'prod1', title: 'Product 1'},
              price: {amount: '10.00', currencyCode: 'USD'},
              compareAtPrice: null
            },
            quantity: 1,
            attributes: [],
            discountAllocations: []
          },
          {
            id: 'line2',
            merchandise: {
              product: {id: 'prod2', title: 'Product 2'},
              price: {amount: '20.00', currencyCode: 'USD'},
              compareAtPrice: null
            },
            quantity: 1,
            attributes: [],
            discountAllocations: []
          }
        ],
        // This will trigger the error: 1 allocation for 2 line items
        discountAllocations: [{
          discountedAmount: {amount: '5.00', currencyCode: 'USD'},
          discountApplication: {title: 'Shipping Discount'}
        }],
        discountCodes: [],
        cost: MOCK_CART_COST
      };

      const result = mapCartPayload(cart);

      // Verify discount applications are empty
      assert.deepStrictEqual(result.discountApplications, []);

      // Verify line items are preserved
      assert.strictEqual(result.lineItems.length, 2);
      assert.strictEqual(result.lineItems[0].title, 'Product 1');
      assert.strictEqual(result.lineItems[1].title, 'Product 2');

      // Verify line items have no discount allocations
      assert.deepStrictEqual(result.lineItems[0].discountAllocations, []);
      assert.deepStrictEqual(result.lineItems[1].discountAllocations, []);

      // Verify error was logged
      assert.strictEqual(consoleErrors.length, 1);
      assert.strictEqual(consoleErrors[0][0], 'Error mapping discounts:');
      assert.match(consoleErrors[0][1], /Invalid number of order-level discount allocations/);

      // Restore console.error
      // eslint-disable-next-line no-console
      console.error = originalConsoleError;
    });

    test('it handles missing discount application gracefully', () => {
      // Mock console.error to capture output
      // eslint-disable-next-line no-console
      const originalConsoleError = console.error;
      const consoleErrors = [];

      // eslint-disable-next-line no-console
      console.error = (...args) => {
        consoleErrors.push(args);
      };

      // Cart with line item discount allocation but no matching discount application
      const cart = {
        lines: [
          {
            id: 'line1',
            merchandise: {
              product: {id: 'prod1', title: 'Product 1'},
              price: {amount: '10.00', currencyCode: 'USD'},
              compareAtPrice: null
            },
            quantity: 1,
            attributes: [],
            discountAllocations: [{
              discountedAmount: {amount: '2.00', currencyCode: 'USD'},
              discountApplication: {code: 'MISSING_CODE'}
            }]
          }
        ],
        discountAllocations: [],
        discountCodes: [],
        cost: MOCK_CART_COST
      };

      const result = mapCartPayload(cart);

      // Verify line items are preserved
      assert.strictEqual(result.lineItems.length, 1);
      assert.strictEqual(result.lineItems[0].title, 'Product 1');

      // Verify line item has no discount allocations due to error
      assert.deepStrictEqual(result.lineItems[0].discountAllocations, []);

      // Verify error was logged (only one error for discount mapping failure)
      assert.strictEqual(consoleErrors.length, 1);
      assert.strictEqual(consoleErrors[0][0], 'Error mapping discounts:');

      // Restore console.error
      // eslint-disable-next-line no-console
      console.error = originalConsoleError;
    });
  });
});
