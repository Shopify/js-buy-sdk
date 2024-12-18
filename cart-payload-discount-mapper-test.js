import assert from 'assert';
import {mapCartPayload} from '../src/cart-payload-mapper';
import {deepSortLines, deepSortDiscountApplications} from '../src/utilities/cart-discount-mapping';

suite.only('cart-payload-mapper-test', () => {
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

    test('FAILS: can map a fixed amount product discount', () => {
      const result = mapCartPayload({
        lines: [
          {
            id: 'gid://shopify/CartLine/5c0159e9-5793-48da-8737-498b1427db9a?cart=Z2NwLXVzLWNlbnRyYWwxOjAxSkU0VlRLSzg1SEVOQlk2TTEyRzVLMkUw',
            quantity: 3,
            discountAllocations: [
              {
                discountedAmount: {
                  amount: 30.0,
                  currencyCode: 'USD'
                },
                code: '10OFF',
                discountApplication: {
                  targetType: 'LINE_ITEM',
                  allocationMethod: 'EACH',
                  targetSelection: 'ENTITLED',
                  value: {
                    amount: 30.0,
                    currencyCode: 'USD'
                  }
                }
              }
            ],
            cost: {
              totalAmount: {
                amount: 570.0,
                currencyCode: 'USD'
              }
            },
            merchandise: {
              id: 'gid://shopify/ProductVariant/48535896522774',
              title: 'Default Title',
              product: {
                id: 'gid://shopify/Product/9899493556246',
                title: 'Test Product'
              },
              price: {
                amount: '200.0',
                currencyCode: 'USD'
              }
            }
          }
        ],
        discountAllocations: [],
        discountCodes: [{
          applicable: true,
          code: '10OFF'
        }]
      });

      const expectedDiscountApplications = [
        {
          __typename: 'DiscountApplication',
          targetSelection: 'ENTITLED',
          allocationMethod: 'EACH',
          targetType: 'LINE_ITEM',
          value: {
            amount: 30.0,
            currencyCode: 'USD'
          },
          code: '10OFF',
          applicable: true,
          hasNextPage: false,
          hasPreviousPage: false,
          type: {
            name: 'DiscountApplication',
            kind: 'OBJECT',
            fieldBaseTypes: {
              applicable: 'Boolean',
              code: 'String'
            },
            implementsNode: false
          }
        }
      ];
      const expectedCheckoutLines = [
        {
          id: 'gid://shopify/CartLine/5c0159e9-5793-48da-8737-498b1427db9a?cart=Z2NwLXVzLWNlbnRyYWwxOjAxSkU0VlRLSzg1SEVOQlk2TTEyRzVLMkUw',
          quantity: 3,
          discountAllocations: [
            {
              allocatedAmount: {
                amount: 30.0,
                currencyCode: 'USD',
                type: {
                  name: 'DiscountApplication',
                  kind: 'OBJECT',
                  fieldBaseTypes: {
                    amount: 'Decimal',
                    currencyCode: 'CurrencyCode'
                  }
                },
                discountApplication: {
                  __typename: 'DiscountApplication',
                  hasNextPage: false,
                  hasPreviousPage: false,
                  code: '10OFF',
                  targetSelection: 'ENTITLED',
                  allocationMethod: 'EACH',
                  targetType: 'LINE_ITEM',
                  value: {
                    amount: 30.0,
                    currencyCode: 'USD',
                    type: {
                      name: 'MoneyV2',
                      kind: 'OBJECT',
                      fieldBaseTypes: {
                      }
                    }
                  },
                  applicable: true,
                  type: {
                    name: 'DiscountApplication',
                    kind: 'OBJECT',
                    fieldBaseTypes: {
                      applicable: 'Boolean',
                      code: 'String'
                    },
                    implementsNode: false
                  }
                }
              }
            }
          ]
        }
      ];

      assert.deepStrictEqual(
        deepSortDiscountApplications(result.discountApplications),
        deepSortDiscountApplications(expectedDiscountApplications)
      );

      for (let i = 0; i < result.lineItems.length; i++) {
        assert.deepStrictEqual(
          result.lineItems[i].discountAllocations,
          expectedCheckoutLines[i].discountAllocations
        );
      }
    });

    test('FAILS: can map a cart with multiple fixed amount product discounts', () => {
      const result = mapCartPayload({
        lines: [
          {
            id: 'gid://shopify/CartLine/fbb590ba-b078-4d80-a95a-f7252174f06f?cart=Z2NwLXVzLWNlbnRyYWwxOjAxSkU1MDFNOVpZWjhaUkVHNFgzN000RDhB',
            discountAllocations: [
              {
                discountedAmount: {
                  amount: 5.0,
                  currencyCode: 'USD'
                },
                title: '5OFFPRODUCT',
                discountApplication: {
                  targetType: 'LINE_ITEM',
                  allocationMethod: 'EACH',
                  targetSelection: 'ENTITLED',
                  value: {
                    amount: 5.0,
                    currencyCode: 'USD'
                  }
                }
              }
            ],
            quantity: 1,
            cost: {
              totalAmount: {
                amount: 65.0,
                currencyCode: 'USD'
              }
            },
            merchandise: {
              id: 'gid://shopify/ProductVariant/48535896522774',
              title: 'Default Title',
              product: {
                id: 'gid://shopify/Product/9899493556246',
                title: 'Test Product'
              },
              price: {
                amount: '200.0',
                currencyCode: 'USD'
              }
            }
          },
          {
            id: 'gid://shopify/CartLine/2b437fb9-33fd-4424-8ea0-fcd275ae65f7?cart=Z2NwLXVzLWNlbnRyYWwxOjAxSkU1MDFNOVpZWjhaUkVHNFgzN000RDhB',
            quantity: 3,
            discountAllocations: [
              {
                discountedAmount: {
                  amount: 450.0,
                  currencyCode: 'USD'
                },
                title: '150offvariant',
                discountApplication: {
                  targetType: 'LINE_ITEM',
                  allocationMethod: 'EACH',
                  targetSelection: 'ENTITLED',
                  value: {
                    amount: 450.0,
                    currencyCode: 'USD'
                  }
                }
              }
            ],
            cost: {
              totalAmount: {
                amount: 150.0,
                currencyCode: 'USD'
              }
            },
            merchandise: {
              id: 'gid://shopify/ProductVariant/48535896522775',
              title: 'Default Title',
              product: {
                id: 'gid://shopify/Product/9899493556247',
                title: 'Test Product 2'
              },
              price: {
                amount: '200.0',
                currencyCode: 'USD'
              }
            }
          }
        ],
        discountAllocations: [],
        discountCodes: []
      });

      const expectedDiscountApplications = [
        {
          targetSelection: 'ENTITLED',
          allocationMethod: 'EACH',
          targetType: 'LINE_ITEM',
          title: '150offvariant',
          value: {
            amount: 450.0,
            currencyCode: 'USD'
          }
        },
        {
          targetSelection: 'ENTITLED',
          allocationMethod: 'EACH',
          targetType: 'LINE_ITEM',
          title: '5OFFPRODUCT',
          value: {
            amount: 5.0,
            currencyCode: 'USD'
          }
        }
      ];

      assert.deepStrictEqual(
        deepSortDiscountApplications(result.discountApplications),
        deepSortDiscountApplications(expectedDiscountApplications)
      );
    });

    test('FAILS: can map a cart with a combination of multiple order discounts and multiple product discounts', () => {
      const result = mapCartPayload({
        lines: [
          {
            id: 'gid://shopify/CartLine/3c67754f-e9ae-4861-a4c0-870cb5adffec?cart=Z2NwLXVzLWNlbnRyYWwxOjAxSkRWMlhYVkhXTlhYODcyNFkzQzJRUDdH',
            quantity: 1,
            discountAllocations: [
              {
                discountedAmount: {
                  amount: 10.0,
                  currencyCode: 'USD'
                },
                code: '10OFF',
                discountApplication: {
                  targetType: 'LINE_ITEM',
                  allocationMethod: 'EACH',
                  targetSelection: 'ENTITLED',
                  value: {
                    amount: 10.0,
                    currencyCode: 'USD'
                  }
                }
              }
            ],
            cost: {
              totalAmount: {
                amount: 60.0,
                currencyCode: 'USD'
              }
            },
            merchandise: {
              id: 'gid://shopify/ProductVariant/48535896522774',
              title: 'Default Title',
              product: {
                id: 'gid://shopify/Product/9899493556246',
                title: 'Test Product'
              },
              price: {
                amount: '200.0',
                currencyCode: 'USD'
              }
            }
          },
          {
            id: 'gid://shopify/CartLine/c1827851-ad14-4e25-9a4a-21d50cf6b83c?cart=Z2NwLXVzLWNlbnRyYWwxOjAxSkRWMlhYVkhXTlhYODcyNFkzQzJRUDdH',
            quantity: 3,
            discountAllocations: [
              {
                discountedAmount: {
                  amount: 450.0,
                  currencyCode: 'USD'
                },
                title: '150offvariant',
                discountApplication: {
                  targetType: 'LINE_ITEM',
                  allocationMethod: 'EACH',
                  targetSelection: 'ENTITLED',
                  value: {
                    amount: 450.0,
                    currencyCode: 'USD'
                  }
                }
              }
            ],
            cost: {
              totalAmount: {
                amount: 150.0,
                currencyCode: 'USD'
              }
            },
            merchandise: {
              id: 'gid://shopify/ProductVariant/48535896522775',
              title: 'Default Title',
              product: {
                id: 'gid://shopify/Product/9899493556247',
                title: 'Test Product 2'
              },
              price: {
                amount: '200.0',
                currencyCode: 'USD'
              }
            }
          }
        ],
        discountAllocations: [
          {
            discountedAmount: {
              amount: 3.0,
              currencyCode: 'USD'
            },
            title: '5 off order',
            discountApplication: {
              targetType: 'LINE_ITEM',
              allocationMethod: 'ACROSS',
              targetSelection: 'ALL',
              value: {
                percentage: 5
              }
            }
          },
          {
            discountedAmount: {
              amount: 3.0,
              currencyCode: 'USD'
            },
            title: '5OFF',
            discountApplication: {
              targetType: 'LINE_ITEM',
              allocationMethod: 'ACROSS',
              targetSelection: 'ALL',
              value: {
                percentage: 5
              }
            }
          },
          {
            discountedAmount: {
              amount: 7.5,
              currencyCode: 'USD'
            },
            title: '5 off order',
            discountApplication: {
              targetType: 'LINE_ITEM',
              allocationMethod: 'ACROSS',
              targetSelection: 'ALL',
              value: {
                percentage: 5
              }
            }
          },
          {
            discountedAmount: {
              amount: 7.5,
              currencyCode: 'USD'
            },
            title: '5OFF',
            discountApplication: {
              targetType: 'LINE_ITEM',
              allocationMethod: 'ACROSS',
              targetSelection: 'ALL',
              value: {
                percentage: 5
              }
            }
          }
        ],
        discountCodes: [
          {
            applicable: true,
            code: '10OFF'
          }
        ]
      });

      const expectedDiscountApplications = [
        {
          targetSelection: 'ENTITLED',
          allocationMethod: 'EACH',
          targetType: 'LINE_ITEM',
          value: {
            amount: 450.0,
            currencyCode: 'USD'
          },
          title: '150offvariant'
        },
        {
          targetSelection: 'ALL',
          allocationMethod: 'ACROSS',
          targetType: 'LINE_ITEM',
          value: {
            percentage: 5
          },
          title: '5 off order'
        },
        {
          targetSelection: 'ALL',
          allocationMethod: 'ACROSS',
          targetType: 'LINE_ITEM',
          value: {
            percentage: 5
          },
          title: '5OFF'
        },
        {
          targetSelection: 'ENTITLED',
          allocationMethod: 'EACH',
          targetType: 'LINE_ITEM',
          value: {
            amount: 10.0,
            currencyCode: 'USD'
          },
          code: '10OFF',
          applicable: true
        }
      ];
      const expectedLineItems = [
        {
          id: 'gid://shopify/CartLine/c1827851-ad14-4e25-9a4a-21d50cf6b83c?cart=Z2NwLXVzLWNlbnRyYWwxOjAxSkRWMlhYVkhXTlhYODcyNFkzQzJRUDdH',
          quantity: 3,
          discountAllocations: [
            {
              allocatedAmount: {
                amount: 450.0,
                currencyCode: 'USD'
              },
              discountApplication: {
                targetSelection: 'ENTITLED',
                allocationMethod: 'EACH',
                targetType: 'LINE_ITEM',
                value: {
                  amount: 450.0,
                  currencyCode: 'USD'
                },
                title: '150offvariant'
              }
            },
            {
              allocatedAmount: {
                amount: 7.5,
                currencyCode: 'USD'
              },
              discountApplication: {
                targetSelection: 'ALL',
                allocationMethod: 'ACROSS',
                targetType: 'LINE_ITEM',
                value: {
                  percentage: 5
                },
                title: '5 off order'
              }
            },
            {
              allocatedAmount: {
                amount: 7.5,
                currencyCode: 'USD'
              },
              discountApplication: {
                targetSelection: 'ALL',
                allocationMethod: 'ACROSS',
                targetType: 'LINE_ITEM',
                value: {
                  percentage: 5
                },
                title: '5OFF'
              }
            }
          ]
        },
        {
          id: 'gid://shopify/CartLine/3c67754f-e9ae-4861-a4c0-870cb5adffec?cart=Z2NwLXVzLWNlbnRyYWwxOjAxSkRWMlhYVkhXTlhYODcyNFkzQzJRUDdH',
          quantity: 1,
          discountAllocations: [
            {
              allocatedAmount: {
                amount: 3.0,
                currencyCode: 'USD'
              },
              discountApplication: {
                targetSelection: 'ALL',
                allocationMethod: 'ACROSS',
                targetType: 'LINE_ITEM',
                value: {
                  percentage: 5
                },
                title: '5 off order'
              }
            },
            {
              allocatedAmount: {
                amount: 3.0,
                currencyCode: 'USD'
              },
              discountApplication: {
                targetSelection: 'ALL',
                allocationMethod: 'ACROSS',
                targetType: 'LINE_ITEM',
                value: {
                  percentage: 5
                },
                title: '5OFF'
              }
            },
            {
              allocatedAmount: {
                amount: 10.0,
                currencyCode: 'USD'
              },
              discountApplication: {
                targetSelection: 'ENTITLED',
                allocationMethod: 'EACH',
                targetType: 'LINE_ITEM',
                value: {
                  amount: 10.0,
                  currencyCode: 'USD'
                },
                code: '10OFF',
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
});

