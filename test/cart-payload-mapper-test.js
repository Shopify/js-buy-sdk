import assert from 'assert';
import { mapCartPayload } from '../src/cart-payload-mapper';
import {
  MOCK_CART_ATTRIBUTES,
  MOCK_CART_COST,
  MOCK_DATE,
  MOCK_10_CAD_GIFT_CARD,
  MOCK_15_USD_GIFT_CARD,
  MOCK_CHECKOUT_LINE_ITEMS,
  MOCK_CART_LINE_ITEMS
} from './cart-payload-mapper-fixtures';
import { withType } from './cart-payload-mapper-utilities';
import { deepSortLines, deepSortDiscountApplications } from '../src/utilities/cart-discount-mapping';

suite.only('cart-payload-mapper-test', () => {
  suite('appliedGiftCards', () => {
    test('it returns applied gift cards from cart', () => {
      const cart = {
        appliedGiftCards: [MOCK_10_CAD_GIFT_CARD, MOCK_15_USD_GIFT_CARD]
      };

      const result = mapCartPayload(cart);
      assert.deepStrictEqual(result.appliedGiftCards, cart.appliedGiftCards);
    });

    test('it returns empty array when there are no applied gift cards', () => {
      const cart = { appliedGiftCards: [] };
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
        id: "gid://shopify/Cart/Z2NwLXVzLWNlbnRyYWwxOjAxSkNFV1ROLkZORzJZOUg5V1gwWTI1RDRL?key=d4438ff09137256a69a03e246c531b87"
      };

      const result = mapCartPayload(cart);
      assert.strictEqual(result.id, cart.id);
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
  
  suite('discount allocations (order level and product level)', () => {
    test('it returns empty array when there are no applicable discounts', () => {
      const cart = {
        discountCodes: [],
        discountAllocations: [],
        lines: []
      };

      const result = mapCartPayload(cart);
      assert.deepStrictEqual(result.discountApplications, []);
    });

    test('can map a fixed amount product discount', () => {
      const result = mapCartPayload({
        lines: [
          {
            "id": "gid://shopify/CartLine/5c0159e9-5793-48da-8737-498b1427db9a?cart=Z2NwLXVzLWNlbnRyYWwxOjAxSkU0VlRLSzg1SEVOQlk2TTEyRzVLMkUw",
            "quantity": 3,
            "discountAllocations": [
              {
                "discountedAmount": {
                  "amount": 30.0,
                  "currencyCode": "USD"
                },
                "code": "10OFF",
                "discountApplication": {
                  "targetType": "LINE_ITEM",
                  "allocationMethod": "EACH",
                  "targetSelection": "ENTITLED",
                  "value": {
                    "amount": 30.0,
                    "currencyCode": "USD"
                  }
                }
              }
            ],
            "cost": {
              "totalAmount": {
                "amount": 570.0,
                "currencyCode": "USD"
              }
            },
            merchandise: {
              "id": "gid://shopify/ProductVariant/48535896522774",
              "title": "Default Title",
              "product": {
                "id": "gid://shopify/Product/9899493556246",
                "title": "Test Product"
              },
              "price": {
                "amount": "200.0",
                "currencyCode": "USD"
              }
            },
          }
        ],
        discountAllocations: [],
        discountCodes: [{
          "applicable": true,
          "code": "10OFF"
        }],
      });

      const expectedDiscountApplications = [
        {
          "targetSelection": "ENTITLED",
          "allocationMethod": "EACH",
          "targetType": "LINE_ITEM",
          "value": {
            "amount": 30.0,
            "currencyCode": "USD"
          },
          "code": "10OFF",
          "applicable": true
        }
      ];
      const expectedCheckoutLines = [
        {
          "id": "gid://shopify/CartLine/5c0159e9-5793-48da-8737-498b1427db9a?cart=Z2NwLXVzLWNlbnRyYWwxOjAxSkU0VlRLSzg1SEVOQlk2TTEyRzVLMkUw",
          "quantity": 3,
          "discountAllocations": [
            {
              "allocatedAmount": {
                "amount": 30.0,
                "currencyCode": "USD"
              },
              "discountApplication": {
                "code": "10OFF",
                "targetSelection": "ENTITLED",
                "allocationMethod": "EACH",
                "targetType": "LINE_ITEM",
                "value": {
                  "amount": 30.0,
                  "currencyCode": "USD"
                },
                "applicable": true
              }
            }
          ]
        }
      ]

      assert.deepStrictEqual(
        deepSortDiscountApplications(result.discountApplications),
        deepSortDiscountApplications(expectedDiscountApplications)
      );

      for (let i = 0; i < result.lineItems.length; i++) {
        assert.deepStrictEqual(
          result.lineItems[i].discountAllocations,
          expectedCheckoutLines[i].discountAllocations
        )
      }
    });

    test('can map a cart with multiple fixed amount product discounts', () => {
      const result = mapCartPayload({
        lines: [
          {
            "id": "gid://shopify/CartLine/fbb590ba-b078-4d80-a95a-f7252174f06f?cart=Z2NwLXVzLWNlbnRyYWwxOjAxSkU1MDFNOVpZWjhaUkVHNFgzN000RDhB",
            "discountAllocations": [
              {
                "discountedAmount": {
                  "amount": 5.0,
                  "currencyCode": "USD"
                },
                "title": "5OFFPRODUCT",
                "discountApplication": {
                  "targetType": "LINE_ITEM",
                  "allocationMethod": "EACH",
                  "targetSelection": "ENTITLED",
                  "value": {
                    "amount": 5.0,
                    "currencyCode": "USD"
                  }
                }
              }
            ],
            "quantity": 1,
            "cost": {
              "totalAmount": {
                "amount": 65.0,
                "currencyCode": "USD"
              }
            },
            merchandise: {
              "id": "gid://shopify/ProductVariant/48535896522774",
              "title": "Default Title",
              "product": {
                "id": "gid://shopify/Product/9899493556246",
                "title": "Test Product"
              },
              "price": {
                "amount": "200.0",
                "currencyCode": "USD"
              }
            },
          },
          {
            "id": "gid://shopify/CartLine/2b437fb9-33fd-4424-8ea0-fcd275ae65f7?cart=Z2NwLXVzLWNlbnRyYWwxOjAxSkU1MDFNOVpZWjhaUkVHNFgzN000RDhB",
            "quantity": 3,
            "discountAllocations": [
              {
                "discountedAmount": {
                  "amount": 450.0,
                  "currencyCode": "USD"
                },
                "title": "150offvariant",
                "discountApplication": {
                  "targetType": "LINE_ITEM",
                  "allocationMethod": "EACH",
                  "targetSelection": "ENTITLED",
                  "value": {
                    "amount": 450.0,
                    "currencyCode": "USD"
                  }
                }
              }
            ],
            "cost": {
              "totalAmount": {
                "amount": 150.0,
                "currencyCode": "USD"
              }
            },
            merchandise: {
              "id": "gid://shopify/ProductVariant/48535896522775",
              "title": "Default Title",
              "product": {
                "id": "gid://shopify/Product/9899493556247",
                "title": "Test Product 2"
              },
              "price": {
                "amount": "200.0",
                "currencyCode": "USD"
              }
            },
          }
        ],
        discountAllocations: [],
        discountCodes: [],
      });

      const expectedDiscountApplications = [
        {
          "targetSelection": "ENTITLED",
          "allocationMethod": "EACH",
          "targetType": "LINE_ITEM",
          "title": "150offvariant",
          "value": {
            "amount": 450.0,
            "currencyCode": "USD"
          }
        },
        {
          "targetSelection": "ENTITLED",
          "allocationMethod": "EACH",
          "targetType": "LINE_ITEM",
          "title": "5OFFPRODUCT",
          "value": {
            "amount": 5.0,
            "currencyCode": "USD"
          }
        }
      ];
      const expectedLineItems = [
        {
          "id": "gid://shopify/CartLine/2b437fb9-33fd-4424-8ea0-fcd275ae65f7?cart=Z2NwLXVzLWNlbnRyYWwxOjAxSkU1MDFNOVpZWjhaUkVHNFgzN000RDhB",
          "quantity": 3,
          "discountAllocations": [
            {
              "allocatedAmount": {
                "amount": 450.0,
                "currencyCode": "USD"
              },
              "discountApplication": {
                "title": "150offvariant",
                "targetSelection": "ENTITLED",
                "allocationMethod": "EACH",
                "targetType": "LINE_ITEM",
                "value": {
                  "amount": 450.0,
                  "currencyCode": "USD"
                },
              }
            }
          ]
        },
        {
          "id": "gid://shopify/CartLine/fbb590ba-b078-4d80-a95a-f7252174f06f?cart=Z2NwLXVzLWNlbnRyYWwxOjAxSkU1MDFNOVpZWjhaUkVHNFgzN000RDhB",
          "quantity": 1,
          "discountAllocations": [
            {
              "allocatedAmount": {
                "amount": 5.0,
                "currencyCode": "USD"
              },
              "discountApplication": {
                "targetSelection": "ENTITLED",
                "allocationMethod": "EACH",
                "targetType": "LINE_ITEM",
                "value": {
                  "amount": 5.0,
                  "currencyCode": "USD"
                },
                "title": "5OFFPRODUCT"
              }
            }
          ]
        }
      ];

      assert.deepStrictEqual(
        deepSortDiscountApplications(result.discountApplications),
        deepSortDiscountApplications(expectedDiscountApplications)
      );

      const sortedResult = deepSortLines(result.lineItems);
      const sortedExpected = deepSortLines(expectedLineItems);

      // for (let i = 0; i < result.lineItems.length; i++) {
      //   assert.deepStrictEqual(
      //     sortedResult[i].discountAllocations,
      //     sortedExpected[i].discountAllocations
      //   )
      // }
    });

    test.only('can map a cart with a combination of multiple order discounts and multiple product discounts', () => {
      const result = mapCartPayload({
        lines: [
          {
            id: "gid://shopify/CartLine/3c67754f-e9ae-4861-a4c0-870cb5adffec?cart=Z2NwLXVzLWNlbnRyYWwxOjAxSkRWMlhYVkhXTlhYODcyNFkzQzJRUDdH",
            quantity: 1,
            discountAllocations: [
              {
                discountedAmount: {
                  amount: 10.0,
                  currencyCode: "USD"
                },
                code: "10OFF",
                discountApplication: {
                  targetType: "LINE_ITEM",
                  allocationMethod: "EACH",
                  targetSelection: "ENTITLED",
                  value: {
                    amount: 10.0,
                    currencyCode: "USD"
                  }
                }
              }
            ],
            cost: {
              totalAmount: {
                amount: 60.0,
                currencyCode: "USD"
              }
            },
            merchandise: {
              "id": "gid://shopify/ProductVariant/48535896522774",
              "title": "Default Title",
              "product": {
                "id": "gid://shopify/Product/9899493556246",
                "title": "Test Product"
              },
              "price": {
                "amount": "200.0",
                "currencyCode": "USD"
              }
            }
          },
          {
            id: "gid://shopify/CartLine/c1827851-ad14-4e25-9a4a-21d50cf6b83c?cart=Z2NwLXVzLWNlbnRyYWwxOjAxSkRWMlhYVkhXTlhYODcyNFkzQzJRUDdH",
            quantity: 3,
            discountAllocations: [
              {
                discountedAmount: {
                  amount: 450.0,
                  currencyCode: "USD"
                },
                title: "150offvariant",
                discountApplication: {
                  targetType: "LINE_ITEM",
                  allocationMethod: "EACH",
                  targetSelection: "ENTITLED",
                  value: {
                    amount: 450.0,
                    currencyCode: "USD"
                  }
                }
              }
            ],
            cost: {
              totalAmount: {
                amount: 150.0,
                currencyCode: "USD"
              }
            },
            merchandise: {
              "id": "gid://shopify/ProductVariant/48535896522775",
              "title": "Default Title",
              "product": {
                "id": "gid://shopify/Product/9899493556247",
                "title": "Test Product 2"
              },
              "price": {
                "amount": "200.0",
                "currencyCode": "USD"
              }
            }
          }
        ],
        discountAllocations: [
          {
            discountedAmount: {
              amount: 3.0,
              currencyCode: "USD"
            },
            title: "5 off order",
            discountApplication: {
              targetType: "LINE_ITEM",
              allocationMethod: "ACROSS",
              targetSelection: "ALL",
              value: {
                percentage: 5
              }
            }
          },
          {
            discountedAmount: {
              amount: 3.0,
              currencyCode: "USD"
            },
            title: "5OFF",
            discountApplication: {
              targetType: "LINE_ITEM",
              allocationMethod: "ACROSS",
              targetSelection: "ALL",
              value: {
                percentage: 5
              }
            }
          },
          {
            discountedAmount: {
              amount: 7.5,
              currencyCode: "USD"
            },
            title: "5 off order",
            discountApplication: {
              targetType: "LINE_ITEM",
              allocationMethod: "ACROSS",
              targetSelection: "ALL",
              value: {
                percentage: 5
              }
            }
          },
          {
            discountedAmount: {
              amount: 7.5,
              currencyCode: "USD"
            },
            title: "5OFF",
            discountApplication: {
              targetType: "LINE_ITEM",
              allocationMethod: "ACROSS",
              targetSelection: "ALL",
              value: {
                percentage: 5
              }
            }
          }
        ],
        discountCodes: [
          {
            applicable: true,
            code: "10OFF"
          }
        ]
      });

      const expectedDiscountApplications = [
        {
          targetSelection: "ENTITLED",
          allocationMethod: "EACH",
          targetType: "LINE_ITEM",
          value: {
            amount: 450.0,
            currencyCode: "USD"
          },
          title: "150offvariant"
        },
        {
          targetSelection: "ALL",
          allocationMethod: "ACROSS",
          targetType: "LINE_ITEM",
          value: {
            percentage: 5
          },
          title: "5 off order"
        },
        {
          targetSelection: "ALL",
          allocationMethod: "ACROSS",
          targetType: "LINE_ITEM",
          value: {
            percentage: 5
          },
          title: "5OFF"
        },
        {
          targetSelection: "ENTITLED",
          allocationMethod: "EACH",
          targetType: "LINE_ITEM",
          value: {
            amount: 10.0,
            currencyCode: "USD"
          },
          code: "10OFF",
          applicable: true
        }
      ];
      const expectedLineItems = [
        {
          id: "gid://shopify/CartLine/c1827851-ad14-4e25-9a4a-21d50cf6b83c?cart=Z2NwLXVzLWNlbnRyYWwxOjAxSkRWMlhYVkhXTlhYODcyNFkzQzJRUDdH",
          quantity: 3,
          discountAllocations: [
            {
              allocatedAmount: {
                amount: 450.0,
                currencyCode: "USD"
              },
              discountApplication: {
                targetSelection: "ENTITLED",
                allocationMethod: "EACH",
                targetType: "LINE_ITEM",
                value: {
                  amount: 450.0,
                  currencyCode: "USD"
                },
                title: "150offvariant"
              }
            },
            {
              allocatedAmount: {
                amount: 7.5,
                currencyCode: "USD"
              },
              discountApplication: {
                targetSelection: "ALL",
                allocationMethod: "ACROSS",
                targetType: "LINE_ITEM",
                value: {
                  percentage: 5
                },
                title: "5 off order"
              }
            },
            {
              allocatedAmount: {
                amount: 7.5,
                currencyCode: "USD"
              },
              discountApplication: {
                targetSelection: "ALL",
                allocationMethod: "ACROSS",
                targetType: "LINE_ITEM",
                value: {
                  percentage: 5
                },
                title: "5OFF"
              }
            }
          ]
        },
        {
          id: "gid://shopify/CartLine/3c67754f-e9ae-4861-a4c0-870cb5adffec?cart=Z2NwLXVzLWNlbnRyYWwxOjAxSkRWMlhYVkhXTlhYODcyNFkzQzJRUDdH",
          quantity: 1,
          discountAllocations: [
            {
              allocatedAmount: {
                amount: 3.0,
                currencyCode: "USD"
              },
              discountApplication: {
                targetSelection: "ALL",
                allocationMethod: "ACROSS",
                targetType: "LINE_ITEM",
                value: {
                  percentage: 5
                },
                title: "5 off order"
              }
            },
            {
              allocatedAmount: {
                amount: 3.0,
                currencyCode: "USD"
              },
              discountApplication: {
                targetSelection: "ALL",
                allocationMethod: "ACROSS",
                targetType: "LINE_ITEM",
                value: {
                  percentage: 5
                },
                title: "5OFF"
              }
            },
            {
              allocatedAmount: {
                amount: 10.0,
                currencyCode: "USD"
              },
              discountApplication: {
                targetSelection: "ENTITLED",
                allocationMethod: "EACH",
                targetType: "LINE_ITEM",
                value: {
                  amount: 10.0,
                  currencyCode: "USD"
                },
                code: "10OFF",
                applicable: true
              }
            }
          ]
        }
      ];

      assert.deepStrictEqual(
        deepSortDiscountApplications(result.discountApplications),
        deepSortDiscountApplications(expectedDiscountApplications)
      );

      const sortedResult = deepSortLines(result.lineItems);
      const sortedExpected = deepSortLines(expectedLineItems);

      for (let i = 0; i < result.lineItems.length; i++) {
        assert.deepStrictEqual(
          sortedResult[i].discountAllocations,
          sortedExpected[i].discountAllocations
        );
      }
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
          email: '',
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
        lineItems: MOCK_CART_LINE_ITEMS,
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

      assert.deepStrictEqual(result.lineItems.length, MOCK_CART_LINE_ITEMS.length);
      result.lineItems.forEach((lineItem, index) => {
        assert.deepStrictEqual(Object.keys(lineItem).sort(), allExpectedFields.sort());

        // Properties we add on manually
        assert.deepStrictEqual(lineItem.type, {
          name: "CheckoutLineItem",
          kind: "OBJECT",
          fieldBaseTypes: {
            customAttributes: "Attribute",
            discountAllocations: "Object[]",
            id: "ID",
            quantity: "Int",
            title: "String",
            variant: "Merchandise"
          },
          implementsNode: true
        });
        assert.deepStrictEqual(lineItem.variant.type, {
          name: "ProductVariant",
          kind: "OBJECT",
          fieldBaseTypes: {
            availableForSale: "Boolean",
            compareAtPrice: "MoneyV2",
            id: "ID",
            image: "Image",
            price: "MoneyV2",
            product: "Product",
            selectedOptions: "SelectedOption",
            sku: "String",
            title: "String",
            unitPrice: "MoneyV2",
            unitPriceMeasurement: "UnitPriceMeasurement",
            weight: "Float"
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
    test("returns cart's total cost when there are no applied gift cards", () => {
      const cart = {
        cost: MOCK_CART_COST,
        appliedGiftCards: []
      };

      const result = mapCartPayload(cart);
      assert.deepStrictEqual(result.paymentDue, cart.cost.totalAmount);
    });
  
    test("returns cart's total cost minus applied gift cards", () => {
      const cart = {
        cost: MOCK_CART_COST,
        appliedGiftCards: [MOCK_10_CAD_GIFT_CARD, MOCK_15_USD_GIFT_CARD]
      };

      const result = mapCartPayload(cart);
      assert.deepStrictEqual(
        result.paymentDue,
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
      const result = mapCartPayload(cart);
      assert.strictEqual(result.ready, false);
    });
  });
  
  suite('requiresShipping', () => {
    test('it returns null', () => {
      const cart = {};
      const result = mapCartPayload(cart);
      assert.strictEqual(result.requiresShipping, null);
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
    test("it returns cart's total amount with duties and taxes subtracted", () => {
      const cart = {
        cost: MOCK_CART_COST
      };

      const result = mapCartPayload(cart);
      assert.deepStrictEqual(result.subtotalPrice, withType({
        amount: 292,
        currencyCode: "USD",
      }, 'MoneyV2'));
    });
  
    test("returns cart's total amount when there are no duties and taxes", () => {
      const costWithNoDutiesAndTax = Object.assign({}, MOCK_CART_COST, { totalTaxAmount: null, totalDutyAmount: null });
      const cart = {
        cost: costWithNoDutiesAndTax
      };

      const result = mapCartPayload(cart);
      assert.deepStrictEqual(result.subtotalPrice, withType({
        amount: 317,
        currencyCode: "USD",
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
    test("it returns cart's total amount", () => {
      const cart = {
        cost: MOCK_CART_COST
      };

      const result = mapCartPayload(cart);
      assert.deepStrictEqual(result.totalPrice, cart.cost.totalAmount);
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

    test("returns a value of zero when there is no total tax amount", () => {
      const costWithNoTax = Object.assign({}, MOCK_CART_COST, { totalTaxAmount: null });
      const cart = {
        cost: costWithNoTax
      };

      const result = mapCartPayload(cart);
      assert.deepStrictEqual(result.totalTax, withType({
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

      const result = mapCartPayload(cart);
      assert.strictEqual(result.updatedAt, cart.updatedAt);
    });
  });
  
  suite('webUrl', () => {
    test('it returns checkout URL', () => {
      const cart = {
        checkoutUrl: 'https://shop.com/checkout'
      };

      const result = mapCartPayload(cart);
      assert.strictEqual(result.webUrl, cart.checkoutUrl);
    });
  });
});


