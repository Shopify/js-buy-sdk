import assert from 'assert';
import Client from '../src/client';

suite.only('client-cart-integration-test', () => {
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
    apiUrl = `https://${domain}/api/${client.config.apiVersion}/graphql`;
  });

  teardown(() => {
    client = null;
  });

  suite('create', () => {
    test('it resolves with an empty checkout', () => {
      return client.cart.create({}).then((checkout) => {
        assert.ok((typeof checkout.webUrl === 'string'));
      });
    });

    test('it resolves with a checkout created with custom attributes', () => {
      const input = {
        customAttributes: [
          {
            key: 'my-key',
            value: 'my-value'
          }
        ]
      };

      return client.cart.create(input).then((checkout) => {
        assert.deepEqual(checkout.customAttributes, [
          {
            key: 'my-key',
            value: 'my-value',
            type: {
              name: 'Attribute',
              kind: 'OBJECT',
              fieldBaseTypes: {
                key: 'String',
                value: 'String'
              },
              implementsNode: false
            }
          }]);
      });
    });

    test('it resolves a localized checkout created with buyerIdentity.countryCode', () => {
      const input = {
        buyerIdentity: {
          countryCode: 'ES'
        },
        // NOTE: if we don't pass an item, the cart won't respect the countryCode and set the currencyCode to XXX
        lineItems: [
          {
            variantId: 'gid://shopify/ProductVariant/48535896522774',
            quantity: 1
          }
        ]
      };

      return client.cart.create(input).then((checkout) => {
        console.log('EUR checkout', checkout);
        assert.equal(checkout.paymentDueV2.currencyCode, 'EUR');
      });
    });

    test('it resolves with a checkout created with an email', () => {
      const input = {
        email: 'sdk@shopify.com'
      };

      return client.cart.create(input).then((checkout) => {
        assert.equal(checkout.email, input.email);
      });
    });

    test('it resolves with a checkout created with a line item', () => {
      const input = {
        lineItems: [
          {
            variantId: 'gid://shopify/ProductVariant/48535896522774',
            quantity: 1
          }
        ]
      };

      return client.cart.create(input).then((checkout) => {
        assert.equal(checkout.lineItems.length, 1);
      });
    });

    test('It resolves with a checkout created with multiple line items', () => {
      const input = {
        lineItems: [
          {
            variantId: 'gid://shopify/ProductVariant/48535896522774',
            quantity: 1
          },
          {
            variantId: 'gid://shopify/ProductVariant/48535896555542',
            quantity: 1
          }
        ]
      };

      return client.cart.create(input).then((checkout) => {
        assert.equal(checkout.lineItems.length, 2);
      });
    });

    test('it resolves with a checkout created with a shippingAddress', () => {
      const input = {
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '+16135551111',
          address1: '123 Oak St',
          address2: 'Unit 2',
          city: 'Ottawa',
          company: 'Shopify',
          country: 'Canada',
          province: 'ON',
          zip: '123 ABC'
        }
      };

      return client.cart.create(input).then((checkout) => {
        assert.equal(checkout.shippingAddress.address1, input.shippingAddress.address1);
        assert.equal(checkout.shippingAddress.city, input.shippingAddress.city);
        assert.equal(checkout.shippingAddress.province, input.shippingAddress.province);
        assert.equal(checkout.shippingAddress.country, input.shippingAddress.country);
        assert.equal(checkout.shippingAddress.zip, input.shippingAddress.zip);
      });
    });

    test('it resolves with a checkout created with a note', () => {
      const input = {
        note: 'This is a note!'
      };

      return client.cart.create(input).then((checkout) => {
        assert.equal(checkout.note, input.note);
      });
    });

    // TODO: test all error scenarios
  });

  suite('create / not supported', () => {
    test('it resolves with a checkout ignoring presentmentCurrencyCode', () => {
      const input = {
        presentmentCurrencyCode: 'EUR'
      };

      return client.cart.create(input).then((checkout) => {
        assert.ok(checkout.paymentDueV2.currencyCode !== input.presentmentCurrencyCode);
      });
    });
  });

  suite('fetch', () => {
    test('it resolves with null on checkout.fetch for a bad checkoutId', () => {
      return client.cart.fetch('gid://shopify/Cart/invalid').then((checkout) => {
        assert.equal(checkout, null);
      });
    });

    test('it resolves with a cart on checkout.fetch', () => {
      // should create a cart first and use that
      return client.cart.create({}).then((newCart) => {

        return client.cart.fetch(newCart.id).then((cart) => {
          assert.ok(typeof cart.checkoutUrl === 'undefined');
          assert.equal(cart.webUrl, newCart.webUrl);
        });
      });
    });
  });

  suite('updateAttributes', () => {
    test('it updates a checkout note via updateAttributes', () => {
      const input = {
        note: 'This is a note!'
      };

      return client.cart.create({}).then((newCart) => {
        return client.cart.updateAttributes(newCart.id, input).then((cart) => {
          assert.equal(cart.note, input.note);
        });
      });
    });

    test('it updates a checkout with a single custom attribute', () => {
      const input = {
        customAttributes: [
          {
            key: 'my-key',
            value: 'my-value'
          }
        ]
      };

      const output = {
        customAttributes: [
          {
            key: 'my-key',
            value: 'my-value',
            type: {
              name: 'Attribute',
              kind: 'OBJECT',
              fieldBaseTypes: {
                key: 'String',
                value: 'String'
              },
              implementsNode: false
            }
          }]
      };

      return client.cart.create({}).then((newCart) => {
        return client.cart.updateAttributes(newCart.id, input).then((cart) => {
          assert.deepEqual(cart.customAttributes, output.customAttributes);
        });
      });
    });

    test('it updates a checkout with multiple custom attributes and note', () => {
      const input = {
        customAttributes: [
          {
            key: 'my-key',
            value: 'my-value'
          },
          {
            key: 'my-key2',
            value: 'my-value2'
          }
        ],
        note: 'This is a note!'
      };

      const output = {
        customAttributes: [
          {
            key: 'my-key',
            value: 'my-value',
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
            key: 'my-key2',
            value: 'my-value2',
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
        ],
        note: 'This is a note!'
      };

      return client.cart.create({}).then((newCart) => {
        return client.cart.updateAttributes(newCart.id, input).then((cart) => {
          assert.deepEqual(cart.customAttributes, output.customAttributes);
          assert.equal(cart.note, input.note);
        });
      });
    });

  });

  suite('updateAttributes / not supported', () => {
    test('it resolves with a checkout ignoring allowPartialAddresses', () => {
      const input = {
        allowPartialAddresses: true
      };

      return client.cart.create({}).then((newCart) => {
        return client.cart.updateAttributes(newCart.id, input).then((cart) => {
          assert.equal(cart.id, newCart.id);
        });
      });
    });
  });

  suite('updateEmail', () => {
    test('it updates a checkout email via updateEmail', () => {
      const email = 'sdk@shopify.com';

      return client.cart.create({}).then((newCart) => {
        return client.cart.updateEmail(newCart.id, email).then((cart) => {
          assert.equal(cart.email, email);
        });
      });
    });
  });

  suite('addLineItems', () => {
    test('it adds a line item to a checkout via addLineItems', () => {
      const input = {
        lineItems: [
          {
            variantId: 'gid://shopify/ProductVariant/48535896522774',
            quantity: 1
          }
        ]
      };

      return client.cart.create({}).then((newCart) => {
        return client.cart.addLineItems(newCart.id, input.lineItems).then((cart) => {
          assert.equal(cart.lineItems.length, 1);
        });
      });
    });

    test('it adds multiple line items to a checkout via addLineItems', () => {
      const input = {
        lineItems: [
          {
            variantId: 'gid://shopify/ProductVariant/48535896522774',
            quantity: 1
          },
          {
            variantId: 'gid://shopify/ProductVariant/48535896555542',
            quantity: 1
          }
        ]
      };

      return client.cart.create({}).then((newCart) => {
        return client.cart.addLineItems(newCart.id, input.lineItems).then((cart) => {
          assert.equal(cart.lineItems.length, 2);
        });
      });
    });
  });

  suite('addDiscount', () => {
    suite('empty checkout', () => {
      test('it does not add a fixed amount discount to an empty checkout via addDiscount', () => {
        const discountCode = '10OFF';

        return client.cart.create({}).then((newCart) => {
          return client.cart.addDiscount(newCart.id, discountCode).then((cart) => {
            assert.equal(cart.discountApplications.length, 0);
          });
        });
      });

      test('it does not add a percentage discount to an empty checkout via addDiscount', () => {
        const discountCode = '10PERCENTOFF';

        return client.cart.create({}).then((newCart) => {
          return client.cart.addDiscount(newCart.id, discountCode).then((cart) => {
            assert.equal(cart.discountApplications.length, 0);
          });
        });
      });

    });

    suite('checkout with a single line item', () => {
      test('it adds a fixed amount discount to a checkout with a single line item via addDiscount', () => {

        return client.cart.create({
          lineItems: [
            {
              variantId: 'gid://shopify/ProductVariant/48535896522774',
              quantity: 1
            }
          ]
        }).then((newCart) => {
          return client.cart.addDiscount(newCart.id, '10OFF').then((cart) => {
            // top-level discountApplication exists
            assert.equal(cart.discountApplications.length, 1);

            // top-level discountApplications matches expected structure
            assert.deepEqual(cart.discountApplications[0],
              {
                __typename: 'DiscountCodeApplication',
                targetSelection: 'ENTITLED',
                allocationMethod: 'EACH',
                targetType: 'LINE_ITEM',
                value: {
                  amount: '10.0',
                  currencyCode: 'USD',
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
            assert.equal(cart.lineItems[0].discountAllocations.length, 1);

            // line item discountAllocation matches expected structure
            assert.equal(cart.lineItems[0].discountAllocations[0], {
              allocatedAmount: {
                amount: '10.0',
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
              discountApplication: {
                __typename: 'DiscountCodeApplication',
                targetSelection: 'ENTITLED',
                allocationMethod: 'EACH',
                targetType: 'LINE_ITEM',
                value: {
                  amount: '10.0',
                  currencyCode: 'USD',
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

        return client.cart.create({
          lineItems: [
            {
              variantId: 'gid://shopify/ProductVariant/48535896522774',
              quantity: 1
            }
          ]
        }).then((newCart) => {
          return client.cart.addDiscount(newCart.id, discountCode).then((cart) => {
            assert.equal(cart.discountApplications.length, 1);
            assert.deepEqual(cart.discountApplications[0], {
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
            assert.equal(cart.lineItems[0].discountAllocations.length, 1);
            assert.deepEqual(cart.lineItems[0].discountAllocations[0], {
              allocatedAmount: {
                amount: '20.0',
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

        return client.cart.create({
          lineItems: [
            {
              variantId: 'gid://shopify/ProductVariant/48535896522774',
              quantity: 1
            }
          ]
        }).then((newCart) => {
          return client.cart.addDiscount(newCart.id, discountCode).then((cart) => {
            assert.equal(cart.discountApplications.length, 1);
            assert.deepEqual(cart.discountApplications[0], {
              __typename: 'DiscountCodeApplication',
              targetSelection: 'ALL',
              allocationMethod: 'ACROSS',
              targetType: 'LINE_ITEM',
              value: {
                amount: '50.0',
                currencyCode: 'USD',
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
            assert.equal(cart.lineItems[0].discountAllocations.length, 1);
            assert.equal(cart.lineItems[0].discountAllocations[0], {
              allocatedAmount: {
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
              discountApplication: {
                __typename: 'DiscountCodeApplication',
                targetSelection: 'ALL',
                allocationMethod: 'ACROSS',
                targetType: 'LINE_ITEM',
                value: {
                  amount: '50.0',
                  currencyCode: 'USD',
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

        return client.cart.create({
          lineItems: [
            {
              variantId: 'gid://shopify/ProductVariant/48535896522774',
              quantity: 1
            }
          ]
        }).then((newCart) => {
          return client.cart.addDiscount(newCart.id, discountCode).then((cart) => {
            assert.equal(cart.discountApplications.length, 1);
            assert.deepEqual(cart.discountApplications[0], {
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

        return client.cart.create({
          lineItems: [
            {
              variantId: 'gid://shopify/ProductVariant/48535896522774',
              quantity: 1
            },
            {
              variantId: 'gid://shopify/ProductVariant/48535896555542',
              quantity: 1
            }
          ]
        }).then((newCart) => {
          return client.cart.addDiscount(newCart.id, discountCode).then((cart) => {
            // TODO: check for structure of discountApplications
            assert.equal(cart.discountApplications.length, 1);
            assert.deepEqual(cart.discountApplications[0], {
              allocatedAmount: {
                amount: '10.0',
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
              discountApplication: {
                __typename: 'DiscountCodeApplication',
                targetSelection: 'ENTITLED',
                allocationMethod: 'EACH',
                targetType: 'LINE_ITEM',
                value: {
                  amount: '20.0',
                  currencyCode: 'USD',
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
            assert.equal(cart.lineItems[0].discountAllocations.length, 1);
            assert.deepEqual(cart.lineItems[0].discountAllocations[0], {
              allocatedAmount: {
                amount: '10.0',
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
              discountApplication: {
                __typename: 'DiscountCodeApplication',
                targetSelection: 'ENTITLED',
                allocationMethod: 'EACH',
                targetType: 'LINE_ITEM',
                value: {
                  amount: '20.0',
                  currencyCode: 'USD',
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
            assert.equal(cart.lineItems[1].discountAllocations.length, 1);
            assert.deepEqual(cart.lineItems[1].discountAllocations[0], {
              __typename: 'DiscountCodeApplication',
              targetSelection: 'ENTITLED',
              allocationMethod: 'EACH',
              targetType: 'LINE_ITEM',
              value: {
                amount: '20.0',
                currencyCode: 'USD',
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

        return client.cart.create({
          lineItems: [
            {
              variantId: 'gid://shopify/ProductVariant/48535896522774',
              quantity: 1
            },
            {
              variantId: 'gid://shopify/ProductVariant/48535896555542',
              quantity: 1
            }
          ]
        }).then((newCart) => {
          return client.cart.addDiscount(newCart.id, discountCode).then((cart) => {
            assert.equal(cart.discountApplications.length, 1);
            assert.deepEqual(cart.discountApplications[0], {
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
            assert.equal(cart.lineItems[0].discountAllocations.length, 1);
            assert.deepEqual(cart.lineItems[0].discountAllocations[0], {
              allocatedAmount: {
                amount: '20.0',
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
            assert.equal(cart.lineItems[1].discountAllocations.length, 1);
            assert.deepEqual(cart.lineItems[1].discountAllocations[0], {
              allocatedAmount: {
                amount: '7.0',
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

        return client.cart.create({
          lineItems: [
            {
              variantId: 'gid://shopify/ProductVariant/48535896522774',
              quantity: 1
            },
            {
              variantId: 'gid://shopify/ProductVariant/48535896555542',
              quantity: 1
            }
          ]
        }).then((newCart) => {
          return client.cart.addDiscount(newCart.id, discountCode).then((cart) => {
            assert.equal(cart.discountApplications.length, 1);
            assert.deepEqual(cart.discountApplications[0], {
              __typename: 'DiscountCodeApplication',
              targetSelection: 'ALL',
              allocationMethod: 'ACROSS',
              targetType: 'LINE_ITEM',
              value: {
                amount: '50.0',
                currencyCode: 'USD',
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
            assert.equal(cart.lineItems[0].discountAllocations.length, 1);
            assert.deepEqual(cart.lineItems[0].discountAllocations[0], {
              allocatedAmount: {
                amount: '37.04',
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
              discountApplication: {
                __typename: 'DiscountCodeApplication',
                targetSelection: 'ALL',
                allocationMethod: 'ACROSS',
                targetType: 'LINE_ITEM',
                value: {
                  amount: '50.0',
                  currencyCode: 'USD',
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
            assert.equal(cart.lineItems[1].discountAllocations.length, 1);
            assert.deepEqual(cart.lineItems[1].discountAllocations[0], {
              allocatedAmount: {
                amount: '12.96',
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
              discountApplication: {
                __typename: 'DiscountCodeApplication',
                targetSelection: 'ALL',
                allocationMethod: 'ACROSS',
                targetType: 'LINE_ITEM',
                value: {
                  amount: '50.0',
                  currencyCode: 'USD',
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

      // NOTE: We can't map this because Cart does not create a discountAllocation for the order-level discount on empty carts
      // all we have to work with is discountCodes: [ { "applicable": false, "code": "ORDER50PERCENTOFF" } ]
      test('adds an order-level percentage discount to a checkout with multiple line items via addDiscount', () => {
        const discountCode = 'ORDER50PERCENTOFF';

        return client.cart.create({
          lineItems: [
            {
              variantId: 'gid://shopify/ProductVariant/48535896522774',
              quantity: 1
            },
            {
              variantId: 'gid://shopify/ProductVariant/48535896555542',
              quantity: 1
            }
          ]
        }).then((newCart) => {
          return client.cart.addDiscount(newCart.id, discountCode).then((cart) => {
            assert.equal(cart.discountApplications.length, 1);
            assert.deepEqual(cart.discountApplications[0], {
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
            assert.equal(cart.lineItems[0].discountAllocations.length, 1);
            assert.deepEqual(cart.lineItems[0].discountAllocations[0], {
              allocatedAmount: {
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
            assert.equal(cart.lineItems[1].discountAllocations.length, 1);
            assert.deepEqual(cart.lineItems[1].discountAllocations[0], {
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
      // NOTE: We can't map this because Cart does not create a discountAllocation for the order-level discount on empty carts
      // all we have to work with is discountCodes: [ { "applicable": false, "code": "ORDERFIXED50OFF" } ]
      test('it adds an order-level fixed amount discount to an empty checkout via addDiscount', () => {
        const discountCode = 'ORDERFIXED50OFF';

        return client.cart.create({}).then((newCart) => {
          return client.cart.addDiscount(newCart.id, discountCode).then((cart) => {
            assert.deepEqual(cart.discountApplications[0], {
              __typename: 'DiscountCodeApplication',
              targetSelection: 'ALL',
              allocationMethod: 'ACROSS',
              targetType: 'LINE_ITEM',
              value: {
                amount: '0.0',
                currencyCode: 'USD',
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

      return client.cart.create({}).then((newCart) => {
        return client.cart.addDiscount(newCart.id, discountCode).then((cart) => {
          assert.equal(cart.discountApplications[0], {
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

  suite('removeDiscount', () => { });

  suite(('addGiftCards'), () => {});

  suite(('removeGiftCard'), () => {});

  suite(('removeLineItems'), () => {});

  suite('replaceLineItems', () => {});

  suite('updateLineItems', () => {});

  suite('updateShippingAddress', () => {});
});
