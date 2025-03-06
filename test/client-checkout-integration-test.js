import assert from 'assert';
import Client from '../src/client';

suite('client-checkout-integration-test', () => {
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
        assert.equal(checkout.customAttributes.length, 1);
        assert.equal(checkout.customAttributes[0].value, 'my-value');
        assert.equal(checkout.customAttributes[0].key, 'my-key');
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
            variantId: 'gid://shopify/ProductVariant/50850334310456',
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
            variantId: 'gid://shopify/ProductVariant/50850334310456',
            quantity: 1
          },
          {
            variantId: 'gid://shopify/ProductVariant/50850336211000',
            quantity: 1
          }
        ]
      };

      return client.checkout.create(input).then((checkout) => {
        assert.equal(checkout.lineItems.length, 2);
      });
    });

    suite('shippingAddress', () => {
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
          assert.equal(checkout.shippingAddress.address2, input.shippingAddress.address2);
          assert.equal(checkout.shippingAddress.city, input.shippingAddress.city);
          assert.equal(checkout.shippingAddress.company, input.shippingAddress.company);
          assert.equal(checkout.shippingAddress.firstName, input.shippingAddress.firstName);
          assert.equal(checkout.shippingAddress.lastName, input.shippingAddress.lastName);
          assert.equal(checkout.shippingAddress.phone, input.shippingAddress.phone);
          assert.equal(checkout.shippingAddress.zip, input.shippingAddress.zip);
          // Cart APIs don't return province field
          // eslint-disable-next-line no-undefined
          assert.ok(checkout.shippingAddress.province === undefined);
          assert.equal(checkout.shippingAddress.country, 'Canada');
          // Ensure our country name to country code mapping is working
          assert.equal(checkout.shippingAddress.countryCode, 'CA');
        });
      });

      test('when a country and country code are both present, the country code is used', () => {
        const input = {
          shippingAddress: {
            country: 'Canada',
            countryCode: 'US'
          }
        };

        return client.checkout.create(input).then((checkout) => {
          assert.equal(checkout.shippingAddress.countryCode, 'US');
        });
      });

      test("when a country but no country code is passed as input, an error is thrown if we can't map the input country to a country code", () => {
        const input = {
          shippingAddress: {
            country: 'Unknown Country'
          }
        };

        return client.checkout.create(input).catch((error) => {
          assert.ok(error.message.includes('was provided invalid value for delivery.addresses'));
        });
      });

      test('when a province name but no province code is passed as input, the province name is ignored', () => {
        const input = {
          shippingAddress: {
            country: 'Canada',
            province: 'Ontario'
          }
        };

        return client.checkout.create(input).then((checkout) => {
          // eslint-disable-next-line no-undefined
          assert.ok(checkout.shippingAddress.province === undefined);
        });
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
          countryCode: 'US'
          // NOTE: if we don't pass an item, the cart won't localize setting currencyCode to XXX
        },
        lineItems: [
          {
            variantId: 'gid://shopify/ProductVariant/50850336211000',
            quantity: 1
          }
        ]
      };

      return client.checkout.create(input).then((checkout) => {
        assert.equal(checkout.lineItems.length, 1);
        assert.equal(checkout.buyerIdentity.countryCode, 'US');
        assert.equal(checkout.currencyCode, 'USD');
      });
    });
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
            value: 'my-value'
          }
        ]
      };

      return client.checkout.create({}).then((checkout) => {
        return client.checkout.updateAttributes(checkout.id, input).then((updatedCheckout) => {
          assert.equal(updatedCheckout.customAttributes[0].key, output.customAttributes[0].key);
          assert.equal(updatedCheckout.customAttributes[0].value, output.customAttributes[0].value);
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
            value: 'my-value'
          },
          {
            key: 'my-key2',
            value: 'my-value2'
          }
        ],
        note: 'This is a note!'
      };

      return client.checkout.create({}).then((checkout) => {
        return client.checkout.updateAttributes(checkout.id, input).then((updatedCheckout) => {
          assert.equal(updatedCheckout.customAttributes[0].value, output.customAttributes[0].value);
          assert.equal(updatedCheckout.customAttributes[1].value, output.customAttributes[1].value);
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
            variantId: 'gid://shopify/ProductVariant/50850334310456',
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
            variantId: 'gid://shopify/ProductVariant/50850334310456',
            quantity: 1
          },
          {
            variantId: 'gid://shopify/ProductVariant/50850336211000',
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

  suite('removeLineItems', () => {
    test('it remotes a line item from a checkout via removeLineItems', () => {
      const input = {
        lineItems: [
          {
            variantId: 'gid://shopify/ProductVariant/50850334310456',
            quantity: 1
          }
        ]
      };

      return client.checkout.create(input).then((checkout) => {
        return client.checkout.removeLineItems(checkout.id, checkout.lineItems[0].id).then((updatedCheckout) => {
          assert.equal(updatedCheckout.lineItems.length, 0);
        });
      });
    });

    test('it removes multiple line items from a checkout via removeLineItems', () => {
      const input = {
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
      };

      return client.checkout.create(input).then((checkout) => {
        return client.checkout.removeLineItems(checkout.id, checkout.lineItems[0].id).then((updatedCheckout) => {
          assert.equal(updatedCheckout.lineItems.length, 1);
          assert.equal(updatedCheckout.lineItems[0].variant.Id, input.lineItems[1].variantId);
        });
      });
    });
  });

  suite('replaceLineItems', () => {
    test('it replaces a line item in a checkout via replaceLineItems', () => {
      const input = {
        lineItems: [
          {
            variantId: 'gid://shopify/ProductVariant/50850334310456',
            quantity: 1
          }
        ]
      };

      const replacement = {
        lineItems: [
          {
            variantId: 'gid://shopify/ProductVariant/50850336211000',
            quantity: 1
          }
        ]
      };

      return client.checkout.create(input).then((checkout) => {
        return client.checkout.replaceLineItems(checkout.id, replacement.lineItems).then((updatedCheckout) => {

          assert.equal(updatedCheckout.lineItems[0].variant.id, replacement.lineItems[0].variantId);
        });
      });
    }).timeout(3000);
  });

  suite('updateLineItems', () => {
    test('it updates a line item quantity in a checkout via updateLineItems', () => {
      const input = {
        lineItems: [
          {
            variantId: 'gid://shopify/ProductVariant/50850334310456',
            quantity: 1
          }
        ]
      };

      const updatedQuantity = 2;

      return client.checkout.create(input).then((checkout) => {
        return client.checkout.updateLineItems(checkout.id, [{id: checkout.lineItems[0].id, quantity: updatedQuantity}]).then((updatedCheckout) => {
          assert.equal(updatedCheckout.lineItems[0].quantity, updatedQuantity);
        });
      });
    });

    test('it updates multiple line items attributes in a checkout via updateLineItems', () => {
      const input = {
        lineItems: [
          {
            variantId: 'gid://shopify/ProductVariant/50850334310456'
          },
          {
            variantId: 'gid://shopify/ProductVariant/50850336211000'
          }
        ]
      };

      return client.checkout.create(input).then((checkout) => {
        const customAttributes = [{key: 'my-key', value: 'my-value'}];
        const updateLines = checkout.lineItems.map((lineItem) => {
          return {id: lineItem.id, customAttributes};
        });

        return client.checkout.updateLineItems(checkout.id, updateLines).then((updatedCheckout) => {
          assert.equal(updatedCheckout.lineItems[0].quantity, 1);
          assert.equal(updatedCheckout.lineItems[1].quantity, 1);
          assert.equal(updatedCheckout.lineItems[0].customAttributes[0].key, customAttributes[0].key);
          assert.equal(updatedCheckout.lineItems[1].customAttributes[0].value, customAttributes[0].value);
        });
      });
    });
  });

  suite('updateShippingAddress', () => {
    test.only('it updates the shipping address of a checkout via updateShippingAddress', () => {
      const input = {
        shippingAddress: {
          address1: '123 Oak St',
          address2: 'Unit 2',
          city: 'Ottawa',
          company: 'Shopify',
          country: 'Canada',
          firstName: 'John',
          lastName: 'Doe',
          phone: '+16135551111',
          province: 'ON',
          zip: '123 ABC'
        }
      };

      return client.checkout.create({}).then((checkout) => {
        return client.checkout.updateShippingAddress(checkout.id, input.shippingAddress).then((updatedCheckout) => {
          assert.equal(updatedCheckout.shippingAddress.address1, input.shippingAddress.address1);
          assert.equal(updatedCheckout.shippingAddress.address2, input.shippingAddress.address2);
          assert.equal(updatedCheckout.shippingAddress.city, input.shippingAddress.city);
          assert.equal(updatedCheckout.shippingAddress.company, input.shippingAddress.company);
          assert.equal(updatedCheckout.shippingAddress.country, input.shippingAddress.country);
          assert.equal(updatedCheckout.shippingAddress.firstName, input.shippingAddress.firstName);
          assert.equal(updatedCheckout.shippingAddress.lastName, input.shippingAddress.lastName);
          assert.equal(updatedCheckout.shippingAddress.phone, input.shippingAddress.phone);
          assert.equal(updatedCheckout.shippingAddress.province, input.shippingAddress.province);
          assert.equal(updatedCheckout.shippingAddress.zip, input.shippingAddress.zip);
        });
      });
    });
  });
});
