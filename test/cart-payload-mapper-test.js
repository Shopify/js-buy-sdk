import assert from 'assert';
import CartPayloadMapper from '../src/cart-payload-mapper';
import { MOCK_CART_ATTRIBUTES, MOCK_CART_COST, MOCK_DATE, MOCK_10_CAD_GIFT_CARD, MOCK_15_USD_GIFT_CARD } from './cart-payload-mapper-fixtures';
import { withType } from './cart-payload-mapper-utilities';

suite('cart-payload-mapper-test', () => {
  suite('appliedGiftCards', () => {
    test('it returns applied gift cards from cart', () => {
      const cart = {
        appliedGiftCards: [MOCK_10_CAD_GIFT_CARD, MOCK_15_USD_GIFT_CARD]
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
      const costWithMultipleCurrencyCodes = {
        checkoutChargeAmount: Object.assign({}, MOCK_CART_COST.checkoutChargeAmount, {
          currencyCode: "CAD"
        }),
        subtotalAmount: Object.assign({}, MOCK_CART_COST.subtotalAmount, {
          currencyCode: "AUD"
        }),
        totalAmount: Object.assign({}, MOCK_CART_COST.totalAmount, {
          currencyCode: "KRW"
        })
      };

      const cart = {
        cost: costWithMultipleCurrencyCodes
      };

      assert.strictEqual(new CartPayloadMapper(cart).currencyCode(), cart.cost.totalAmount.currencyCode);
    });
  });
  
  suite('customAttributes', () => {
    test('it returns cart attributes', () => {
      const cart = {
        attributes: MOCK_CART_ATTRIBUTES
      };

      assert.deepStrictEqual(new CartPayloadMapper(cart).customAttributes(), cart.attributes);
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
        cart.cost.checkoutChargeAmount, 'MoneyV2');
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

      assert.deepStrictEqual(new CartPayloadMapper(cart).paymentDue(), cart.cost.totalAmount);
    });
  
    test("returns cart's total cost minus applied gift cards", () => {
      const cart = {
        cost: MOCK_CART_COST,
        appliedGiftCards: [MOCK_10_CAD_GIFT_CARD, MOCK_15_USD_GIFT_CARD]
      };

      assert.deepStrictEqual(
        new CartPayloadMapper(cart).paymentDue(),
        withType({
          amount: 294.82,
          currencyCode: "USD",
        }, 'MoneyV2')
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
        cost: MOCK_CART_COST
      };

      assert.deepStrictEqual(new CartPayloadMapper(cart).subtotalPrice(), withType({
        amount: 292,
        currencyCode: "USD",
      }, 'MoneyV2'));
    });
  
    test("returns cart's total amount when there are no duties and taxes", () => {
      const costWithNoDutiesAndTax = Object.assign({}, MOCK_CART_COST, { totalTaxAmount: null, totalDutyAmount: null });

      const cart = {
        cost: costWithNoDutiesAndTax
      };

      assert.deepStrictEqual(new CartPayloadMapper(cart).subtotalPrice(), withType({
        amount: 317,
        currencyCode: "USD",
      }, 'MoneyV2'));
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

      assert.deepStrictEqual(new CartPayloadMapper(cart).totalPrice(), cart.cost.totalAmount);
    });
  });
  
  suite('totalTax', () => {
    test("it returns cart's total tax amount", () => {
      const cart = {
        cost: MOCK_CART_COST
      };

      assert.deepStrictEqual(new CartPayloadMapper(cart).totalTax(), cart.cost.totalTaxAmount);
    });

    test("returns a value of zero when there is no total tax amount", () => {
      const costWithNoTax = Object.assign({}, MOCK_CART_COST, { totalTaxAmount: null });

      const cart = {
        cost: costWithNoTax
      };

      assert.deepStrictEqual(new CartPayloadMapper(cart).totalTax(), withType({
        amount: 0,
        currencyCode: "USD",
      }, 'MoneyV2'));
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
