import assert from 'assert';
import CartPayloadMapper from '../src/cart-payload-mapper';

const MOCK_DATE = '2017-03-28T16:58:31Z';
const MOCK_CART_COST = {
  checkoutChargeAmount: { amount: 45, currencyCode: "USD" },
  subtotalAmount: { amount: 39, currencyCode: "USD" },
  subtotalAmountEstimated: false,
  totalAmount: { amount: 317, currencyCode: "USD" },
  totalAmountEstimated: false,
  totalDutyAmount: { amount: 10, currencyCode: "USD" },
  totalDutyAmountEstimated: false,
  totalTaxAmount: { amount: 15, currencyCode: "USD" },
  totalTaxAmountEstimated: false,
}

suite('cart-payload-mapper-test', () => {
  suite('appliedGiftCards', () => {
    test('it returns applied gift cards from cart', () => {
      const cart = {
        appliedGiftCards: [
          {
            amountUsedV2: {
              amount: '45.0',
              currencyCode: 'USD'
            },
            balanceV2: {
              amount: '45.0',
              currencyCode: 'USD'
            },
            id: 'gid://shopify/AppliedGiftCard/42854580312',
            lastCharacters: '949f'
          },
          {
            amountUsedV2: {
              amount: '96.18',
              currencyCode: 'USD'
            },
            balanceV2: {
              amount: '6000.12',
              currencyCode: 'USD'
            },
            id: 'gid://shopify/AppliedGiftCard/42854613087',
            lastCharacters: 'hb6a'
          }
        ],
      };
      assert.deepStrictEqual(new CartPayloadMapper(cart).appliedGiftCards(), cart.appliedGiftCards);
    });

    test('it returns empty array when there are no applied gift cards', () => {
      assert.deepStrictEqual(new CartPayloadMapper({appliedGiftCards: []}).appliedGiftCards(), []);
    });
  });
  
  suite('completedAt', () => {
    test('it returns null', () => {
      assert.strictEqual(new CartPayloadMapper({}).completedAt(), null);
    });
  });
  
  suite('createdAt', () => {
    test('it returns cart created at date', () => {
      const cart = {
        createdAt: MOCK_DATE
      };
      assert.strictEqual(new CartPayloadMapper(cart).createdAt(), cart.createdAt);
    });
  });

  suite('id', () => {
    test('it returns a cart ID', () => {
      const cart = {
        id: "gid://shopify/Cart/Z2NwLXVzLWNlbnRyYWwxOjAxSkNFV1ROLkZORzJZOUg5V1gwWTI1RDRL?key=d4438ff09137256a69a03e246c531b87"
      };

      assert.strictEqual(cart.id, new CartPayloadMapper(cart).id());
    });
  });
  
  suite('currencyCode', () => {
    test("it returns currency code from cart's total amount", () => {
      const cart = {
        cost: {
          checkoutChargeAmount: { amount: 45, currencyCode: "CAD" },
          subtotalAmount: { amount: 39, currencyCode: "AUD" },
          subtotalAmountEstimated: false,
          totalAmount: { amount: 317, currencyCode: "KRW" },
          totalAmountEstimated: false,
        }
      };
      assert.strictEqual(new CartPayloadMapper(cart).currencyCode(), cart.cost.totalAmount.currencyCode);
    });
  });
  
  suite('customAttributes', () => {
    test('it maps cart attributes to custom attributes', () => {
      const cart = {
        attributes: [{ key: 'color', value: 'blue' }, { key: 'size', value: 'large' }]
      };
      const expected = [{
        key: 'color',
        value: 'blue',
        type: {
          name: 'Attribute',
          kind: 'OBJECT',
          fieldBaseTypes: {
            key: 'String',
            value: 'String'
          },
          implementsNode: false
        }
      },
      {
        key: 'size',
        value: 'large',
        type: {
          name: 'Attribute',
          kind: 'OBJECT',
          fieldBaseTypes: {
            key: 'String',
            value: 'String'
          },
          implementsNode: false
        }
      }
    ];
      assert.deepStrictEqual(new CartPayloadMapper(cart).customAttributes(), expected);
    });
  });
  
  suite('discountApplications', () => {
    test('it returns empty array when there are no applicable discounts', () => {
      const cart = {
        discountCodes: [],
        discountAllocations: []
      };
      assert.deepStrictEqual(new CartPayloadMapper(cart).discountApplications(), []);
    });

    // TODO add more tests here
  });
  
  suite('email', () => {
    test('it returns email from buyer identity', () => {
      const cart = {
        buyerIdentity: {
          email: 'test@example.com'
        }
      };
      assert.strictEqual(new CartPayloadMapper(cart).email(), cart.buyerIdentity.email);
    });

    it('returns null when there is no buyer identity', () => {
      const cart = {};
      assert.strictEqual(new CartPayloadMapper(cart).email(), null);
    });

    it('returns null when email is an empty string', () => {
      const cart = {
        buyerIdentity: {
          email: '',
        }
      };
      assert.strictEqual(new CartPayloadMapper(cart).email(), null);
    });

    it('returns null when there is no email', () => {
      const cart = {
        buyerIdentity: {}
      };
      assert.strictEqual(new CartPayloadMapper(cart).email(), null);
    });
  });
  
  suite('lineItems', () => {
    test('it returns empty array when no lines', () => {
      const cart = {
        lines: null
      };
      assert.deepStrictEqual(new CartPayloadMapper(cart).lineItems(), []);
    });

    // TODO add more tests here
  });
  
  suite('lineItemsSubtotalPrice', () => {
    test('it returns checkout charge amount', () => {
      const cart = {
        cost: MOCK_CART_COST
      };

      assert.deepStrictEqual(new CartPayloadMapper(cart).lineItemsSubtotalPrice(), 
        CartPayloadMapper.moneyField(cart.cost.checkoutChargeAmount));
    });
  });
  
  suite('note', () => {
    test('it returns cart note', () => {
      const cart = {
        note: 'Test note'
      };
      assert.strictEqual(new CartPayloadMapper(cart).note(), cart.note);
    });
  });
  
  suite('order', () => {
    test('it returns null', () => {
      const cart = {};
      assert.strictEqual(new CartPayloadMapper(cart).order(), null);
    });
  });
  
  suite('orderStatusUrl', () => {
    test('it returns null', () => {
      const cart = {};
      assert.strictEqual(new CartPayloadMapper(cart).orderStatusUrl(), null);
    });
  });
  
  suite('paymentDue', () => {
    test("returns cart's total cost when there are no applied gift cards", () => {
      const cart = {
        cost: MOCK_CART_COST,
        appliedGiftCards: []
      };

      const expected = CartPayloadMapper.moneyField(cart.cost.totalAmount);

      assert.deepStrictEqual(new CartPayloadMapper(cart).paymentDue(), expected);
    });
  
    test("returns cart's total cost minus applied gift cards", () => {
      const giftCard10Cad = {
        amountUsed: {
          amount: 10,
          currencyCode: "CAD",
        },
        amountUsedV2: {
          amount: 10,
          currencyCode: "CAD",
        },
        balance: {
          amount: 0,
          currencyCode: "CAD",
        },
        balanceV2: {
          amount: 0,
          currencyCode: "CAD",
        },
        id: "gid://shopify/AppliedGiftCard/123",
        lastCharacters: "123",
        presentmentAmountUsed: {
          amount: 7.18,
          currencyCode: "USD",
        },
      };
  
      const giftCard15Usd = {
        amountUsed: {
          amount: 15,
          currencyCode: "USD",
        },
        amountUsedV2: {
          amount: 15,
          currencyCode: "USD",
        },
        balance: {
          amount: 0,
          currencyCode: "USD",
        },
        balanceV2: {
          amount: 0,
          currencyCode: "USD",
        },
        id: "gid://shopify/AppliedGiftCard/456",
        lastCharacters: "456",
        presentmentAmountUsed: {
          amount: 15,
          currencyCode: "USD",
        },
      };

      const cart = {
        cost: MOCK_CART_COST,
        appliedGiftCards: [giftCard10Cad, giftCard15Usd]
      };

      assert.deepStrictEqual(
        new CartPayloadMapper(cart).paymentDue(),
        CartPayloadMapper.moneyField(
        {
          amount: 294.82,
          currencyCode: "USD",
        })
      );
    });
  });
  
  suite('ready', () => {
    test('it returns false', () => {
      const cart = {};
      assert.strictEqual(new CartPayloadMapper(cart).ready(), false);
    });
  });
  
  suite('requiresShipping', () => {
    test('it returns null', () => {
      const cart = {};
      assert.strictEqual(new CartPayloadMapper(cart).requiresShipping(), null);
    });
  });
  
  suite('shippingAddress', () => {
    test('it returns first delivery address preference', () => {
      const addresses = [{ address1: '123 Main St' }, { address1: '456 Main St' }];
      const cart = {
        buyerIdentity: {
          deliveryAddressPreferences: addresses
        }
      };
      assert.strictEqual(new CartPayloadMapper(cart).shippingAddress(), addresses[0]);
    });

    test('returns null when there is no buyer identity', () => {
      const cart = {};
      assert.strictEqual(new CartPayloadMapper(cart).shippingAddress(), null);
    });

    test('returns null when there are no delivery address preferences', () => {
      const cart = {
        buyerIdentity: {
          deliveryAddressPreferences: []
        }
      };
      assert.strictEqual(new CartPayloadMapper(cart).shippingAddress(), null);
    });
  });
  
  suite('shippingLine', () => {
    test('it returns null', () => {
      const cart = {};
      assert.strictEqual(new CartPayloadMapper(cart).shippingLine(), null);
    });
  });
  
  suite('subtotalPrice', () => {
    test("it returns cart's total amount with duties and taxes subtracted", () => {
      const cart = {
        cost: {
          checkoutChargeAmount: { amount: 45, currencyCode: "USD" },
          subtotalAmount: { amount: 39, currencyCode: "USD" },
          subtotalAmountEstimated: false,
          totalAmount: { amount: 317, currencyCode: "USD" },
          totalAmountEstimated: false,
          totalDutyAmount: { amount: 10, currencyCode: "USD" },
          totalDutyAmountEstimated: false,
          totalTaxAmount: { amount: 15, currencyCode: "USD" },
          totalTaxAmountEstimated: false,
        }
      };

      const expected = CartPayloadMapper.moneyField({
        amount: 292,
        currencyCode: "USD",
      });

      assert.deepStrictEqual(new CartPayloadMapper(cart).subtotalPrice(), expected);
    });
  
    test("returns cart's total amount when there are no duties and taxes", () => {
      const cart = {
        cost: {
          checkoutChargeAmount: { amount: 45, currencyCode: "USD" },
          subtotalAmount: { amount: 39, currencyCode: "USD" },
          subtotalAmountEstimated: false,
          totalAmount: { amount: 317, currencyCode: "USD" },
          totalAmountEstimated: false,
          totalDutyAmount: { amount: 0, currencyCode: "USD" },
          totalDutyAmountEstimated: false,
          totalTaxAmount: { amount: 0, currencyCode: "USD" },
          totalTaxAmountEstimated: false,
        }
      };

      const expected = CartPayloadMapper.moneyField({
        amount: 317,
        currencyCode: "USD",
      });

      assert.deepStrictEqual(new CartPayloadMapper(cart).subtotalPrice(), expected);
    });
  });
  
  suite('taxExempt', () => {
    test('it returns false', () => {
      const cart = {};
      assert.strictEqual(new CartPayloadMapper(cart).taxExempt(), false);
    });
  });
  
  suite('taxesIncluded', () => {
    test('it returns false', () => {
      const cart = {};
      assert.strictEqual(new CartPayloadMapper(cart).taxesIncluded(), false);
    });
  });
  
  suite('totalPrice', () => {
    test("it returns cart's total amount", () => {
      const cart = {
        cost: MOCK_CART_COST
      };
      assert.deepStrictEqual(new CartPayloadMapper(cart).totalPrice(), 
        CartPayloadMapper.moneyField(cart.cost.totalAmount));
    });
  });
  
  suite('totalTax', () => {
    test("it returns cart's total tax amount", () => {
      const cart = {
        cost: MOCK_CART_COST
      };
      assert.deepStrictEqual(new CartPayloadMapper(cart).totalTax(), 
        CartPayloadMapper.moneyField(cart.cost.totalTaxAmount));
    });

    test("returns a value of zero when there is no total tax amount", () => {
      const cart = {
        cost: {
          checkoutChargeAmount: { amount: 45, currencyCode: "USD" },
          subtotalAmount: { amount: 39, currencyCode: "USD" },
          subtotalAmountEstimated: false,
          totalAmount: { amount: 317, currencyCode: "USD" },
          totalAmountEstimated: false,
          totalDutyAmount: { amount: 10, currencyCode: "USD" },
          totalDutyAmountEstimated: false,
        }
      };

      const expected = CartPayloadMapper.moneyField({
        amount: 0,
        currencyCode: "USD",
      });

      assert.deepStrictEqual(new CartPayloadMapper(cart).totalTax(), expected);
    });
  });
  
  suite('updatedAt', () => {
    test('it returns cart updated at date', () => {
      const cart = {
        updatedAt: MOCK_DATE
      };
      assert.strictEqual(new CartPayloadMapper(cart).updatedAt(), cart.updatedAt);
    });
  });
  
  suite('webUrl', () => {
    test('it returns checkout URL', () => {
      const cart = {
        checkoutUrl: 'https://shop.com/checkout'
      };
      assert.strictEqual(new CartPayloadMapper(cart).webUrl(), cart.checkoutUrl);
    });
  });
});
