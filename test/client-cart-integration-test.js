import mocha from 'mocha';
import assert from 'assert';
import Client from '../src/client';
import fetchMock from './isomorphic-fetch-mock'; // eslint-disable-line import/no-unresolved
import fetchMockPostOnce from './fetch-mock-helper';

// fixtures
import cartFixture from '../fixtures/cart-fixture';
import cartNullFixture from '../fixtures/node-null-fixture';
import cartCreateFixture from '../fixtures/cart-create-fixture';
import cartCreateInvalidVariantIdErrorFixture from '../fixtures/cart-create-invalid-variant-id-error-fixture';
import cartUpdateAttributesFixture from '../fixtures/cart-update-attrs-fixture';
import cartUpdateBuyerIdentityFixture from '../fixtures/cart-update-buyer-identity-fixture';
import cartUpdateBuyerIdentityFixtureWithUserErrors from '../fixtures/cart-update-buyer-identity-fixture-with-user-errors';
import cartLineItemsAddFixture from '../fixtures/cart-line-items-add-fixture';
import cartLineItemsAddFixtureWithUserErrors from '../fixtures/cart-line-items-add-fixture-with-user-errors';
import cartLineItemsUpdateFixture from '../fixtures/cart-line-items-update-fixture';
import cartLineItemsUpdateFixtureWithUserErrors from '../fixtures/cart-line-items-update-fixture-with-user-errors';
import cartLineItemsRemoveFixture from '../fixtures/cart-line-items-remove-fixture';
import cartUpdateDiscountCodesFixture from '../fixtures/cart-update-discount-codes-fixture';
import cartUpdateNoteFixture from '../fixtures/cart-update-note-fixture';
import cartUpdateSelectedDeliveryOptionsFixture from '../fixtures/cart-update-selected-delivery-options-fixture';
import cartUpdateGiftCardCodesFixture from '../fixtures/cart-update-gift-card-codes-fixture';

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

      test('it adds an order-level fixed amount discount to an empty checkout via addDiscount', () => {
        const discountCode = 'ORDERFIXED50OFF';

        return client.cart.create({}).then((newCart) => {
          return client.cart.addDiscount(newCart.id, discountCode).then((cart) => {
            assert.equal(cart.discountApplications.length, 1);
          });
        });
      });

      test('it adds an order-level percentage discount to an empty checkout via addDiscount', () => {
        const discountCode = 'ORDER50PERCENTOFF';

        return client.cart.create({}).then((newCart) => {
          return client.cart.addDiscount(newCart.id, discountCode).then((cart) => {
            assert.equal(cart.discountApplications.length, 1);
          });
        });
      });
    });

    suite('checkout with a single line item', () => {
      test('it adds a fixed amount discount to a checkout with a single line item via addDiscount', () => {
        const discountCode = '10OFF';

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
            // assert.equal(cart.discountApplications[0].value.amount, '10.00');
            assert.equal(cart.lineItems[0].discountAllocations.length, 1);
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
            // assert.equal(cart.discountApplications[0].value.percentage, '10.00');
            // assert.equal(cart.lineItems[0].discountAllocations.length, 1);
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
            // assert.equal(cart.discountApplications[0].value.amount, '50.00');
            // assert.equal(cart.lineItems[0].discountAllocations.length, 0);
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
            // TODO: check for structure of discountApplications
            assert.equal(cart.discountApplications.length, 1);
            // assert.equal(cart.discountApplications[0].value.percentage, '50.00');
            // TODO: check for structure of discountAllocations
            assert.equal(cart.lineItems[0].discountAllocations.length, 0);
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
            // assert.equal(cart.discountApplications[0].value.amount, '10.00');
            // TODO: check for structure of discountAllocations
            assert.equal(cart.lineItems[0].discountAllocations.length, 1);
            assert.equal(cart.lineItems[1].discountAllocations.length, 1);
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
            // assert.equal(cart.discountApplications[0].value.percentage, '10.00');
            // assert.equal(cart.lineItems[0].discountAllocations.length, 1);
            // assert.equal(cart.lineItems[1].discountAllocations.length, 1);
            // TODO: check for structure of line item discountAllocations
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
            // assert.equal(cart.discountApplications[0].value.amount, '50.00');
            // assert.equal(cart.lineItems[0].discountAllocations.length, 0);
            // assert.equal(cart.lineItems[1].discountAllocations.length, 0);
          });
        });
      });

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
            // assert.equal(cart.discountApplications[0].value.percentage, '50.00');
            // assert.equal(cart.lineItems[0].discountAllocations.length, 0);
            // assert.equal(cart.lineItems[1].discountAllocations.length, 0);
          });
        });
      });
    });
  });
});
