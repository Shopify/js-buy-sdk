import assert from 'assert';
import Client from '../src/client';

suite.only('client-checkout-integration-test', () => {
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
    apiUrl = `https://${domain}/api/unstable/graphql`;
  });

  teardown(() => {
    client = null;
  });

  suite('create', () => {
    test('it resolves with an empty checkout', () => {
      return client.checkout.create({}).then((checkout) => {
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

      return client.checkout.create(input).then((checkout) => {
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


    test('it resolves with a checkout created with an email', () => {
      const input = {
        email: 'sdk@shopify.com'
      };

      return client.checkout.create(input).then((checkout) => {
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

      return client.checkout.create(input).then((checkout) => {
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

      return client.checkout.create(input).then((checkout) => {
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

      return client.checkout.create(input).then((checkout) => {
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

      return client.checkout.create(input).then((checkout) => {
        assert.equal(checkout.note, input.note);
      });
    });

    test('it resolves a localized non-empty checkout created with buyerIdentity.countryCode', () => {
      const input = {
        buyerIdentity: {
          countryCode: 'ES'
        },
        // NOTE: if we don't pass an item, the cart won't localize setting currencyCode to XXX
        lineItems: [
          {
            variantId: 'gid://shopify/ProductVariant/48535896522774',
            quantity: 1
          }
        ]
      };

      return client.checkout.create(input).then((checkout) => {
        assert.equal(checkout.paymentDueV2.currencyCode, 'EUR');
      });
    });

    // TODO: test all error scenarios
  });

  suite('create / not supported', () => {
    test('it resolves with a checkout ignoring presentmentCurrencyCode', () => {
      const input = {
        presentmentCurrencyCode: 'EUR'
      };

      return client.checkout.create(input).then((checkout) => {
        assert.ok(checkout.paymentDueV2.currencyCode !== input.presentmentCurrencyCode);
      });
    });

    // NOTE: if we don't pass an item, the updatedCheckout won't respect the countryCode and set the currencyCode to XXX
    // this is a known Cart limitation tracked as Sev3
    test('it does not resolve a localized empty checkout created with buyerIdentity.countryCode', () => {
      const input = {
        buyerIdentity: {
          countryCode: 'ES'
        }
      };

      return client.checkout.create(input).then((checkout) => {
        assert.equal(checkout.paymentDueV2.currencyCode, 'XXX');
      });
    });

  });

  suite('fetch', () => {
    test('it returns a null checkout for an invalid checkoutId', () => {
      return client.checkout.fetch('gid://shopify/Cart/invalid').then((checkout) => {
        assert.equal(checkout, null);
      });
    });

    test('it fetches a checkout by id', () => {
      return client.checkout.create({}).then((checkout) => {
        return client.checkout.fetch(checkout.id).then((updatedCheckout) => {
          assert.ok(typeof updatedCheckout.checkoutUrl === 'undefined');
          assert.equal(updatedCheckout.webUrl, checkout.webUrl);
        });
      });
    });
  });

  suite('updateAttributes', () => {
    test('it updates a checkout note via updateAttributes', () => {
      const input = {
        note: 'This is a note!'
      };

      return client.checkout.create({}).then((checkout) => {
        return client.checkout.updateAttributes(checkout.id, input).then((updatedCheckout) => {
          assert.equal(updatedCheckout.note, input.note);
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

      return client.checkout.create({}).then((checkout) => {
        return client.checkout.updateAttributes(checkout.id, input).then((updatedCheckout) => {
          assert.deepEqual(updatedCheckout.customAttributes, output.customAttributes);
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

      return client.checkout.create({}).then((checkout) => {
        return client.checkout.updateAttributes(checkout.id, input).then((updatedCheckout) => {
          assert.deepEqual(updatedCheckout.customAttributes, output.customAttributes);
          assert.equal(updatedCheckout.note, input.note);
        });
      });
    });

  });

  suite('updateAttributes / not supported', () => {
    test('it resolves with a checkout ignoring allowPartialAddresses', () => {
      const input = {
        allowPartialAddresses: true
      };

      return client.checkout.create({}).then((checkout) => {
        return client.checkout.updateAttributes(checkout.id, input).then((updatedCheckout) => {
          assert.equal(updatedCheckout.id, checkout.id);
        });
      });
    });
  });

  suite('updateEmail', () => {
    test('it updates a checkout email via updateEmail', () => {
      const email = 'sdk@shopify.com';

      return client.checkout.create({}).then((checkout) => {
        return client.checkout.updateEmail(checkout.id, email).then((updatedCheckout) => {
          assert.equal(updatedCheckout.email, email);
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

      return client.checkout.create({}).then((checkout) => {
        return client.checkout.addLineItems(checkout.id, input.lineItems).then((updatedCheckout) => {
          assert.equal(updatedCheckout.lineItems.length, 1);
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

      return client.checkout.create({}).then((checkout) => {
        return client.checkout.addLineItems(checkout.id, input.lineItems).then((updatedCheckout) => {
          assert.equal(updatedCheckout.lineItems.length, 2);
        });
      });
    });
  });

  suite(('addGiftCards'), () => {});

  suite(('removeGiftCard'), () => {});

  suite(('removeLineItems'), () => {});

  suite('replaceLineItems', () => {});

  suite('updateLineItems', () => {});

  suite('updateShippingAddress', () => {});

  suite('checkout totals', () => {});
});
