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
        assert.strictEqual(checkout.customAttributes.length, 1);
        assert.strictEqual(checkout.customAttributes[0].value, 'my-value');
        assert.strictEqual(checkout.customAttributes[0].key, 'my-key');
      });
    });


    test('it resolves with a checkout created with an email', () => {
      const input = {
        email: 'sdk@shopify.com'
      };

      return client.checkout.create(input).then((checkout) => {
        assert.strictEqual(checkout.email, input.email);
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
        assert.strictEqual(checkout.lineItems.length, 1);
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
        assert.strictEqual(checkout.lineItems.length, 2);
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
        assert.strictEqual(checkout.shippingAddress.address1, input.shippingAddress.address1);
        assert.strictEqual(checkout.shippingAddress.city, input.shippingAddress.city);
        assert.strictEqual(checkout.shippingAddress.province, input.shippingAddress.province);
        assert.strictEqual(checkout.shippingAddress.country, input.shippingAddress.country);
        assert.strictEqual(checkout.shippingAddress.zip, input.shippingAddress.zip);
      });
    });

    test('it resolves with a checkout created with a note', () => {
      const input = {
        note: 'This is a note!'
      };

      return client.checkout.create(input).then((checkout) => {
        assert.strictEqual(checkout.note, input.note);
      });
    });

    test('it rejects the promise if there is an error with the input', () => {
      const input = {
        lineItems: [
          {
            variantId: 'gid://shopify/ProductVariant/50850334310456',
            quantity: 99999999
          },
          {
            variantId: 'gid://shopify/ProductVariant/50850336211000',
            quantity: 1
          }
        ]
      };

      return client.checkout.create(input).catch((error) => {
        assert.deepStrictEqual(error, [
          {
            code: 'INVALID',
            field: [
              'input',
              'lines',
              '0',
              'quantity'
            ],
            message: 'The quantity for merchandise with id gid://shopify/ProductVariant/50850334310456 must be greater than zero but less than 1000000.'
          }
        ]);
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
        assert.strictEqual(checkout.lineItems.length, 1);
        assert.strictEqual(checkout.buyerIdentity.countryCode, 'US');
        assert.strictEqual(checkout.currencyCode, 'USD');
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
    test("a localized empty checkout created with buyerIdentity.countryCode will default to the shop's currency", () => {
      const input = {
        buyerIdentity: {
          countryCode: 'ES'
        }
      };

      return client.checkout.create(input).then((checkout) => {
        assert.strictEqual(checkout.paymentDueV2.currencyCode, 'CAD');
      });
    });

  });

  suite('fetch', () => {
    test('it returns a null checkout for an invalid checkoutId', () => {
      return client.checkout.fetch('gid://shopify/Cart/invalid').then((checkout) => {
        assert.strictEqual(checkout, null);
      });
    });

    test('it fetches a checkout by id', () => {
      return client.checkout.create({}).then((checkout) => {
        return client.checkout.fetch(checkout.id).then((updatedCheckout) => {
          assert.ok(typeof updatedCheckout.checkoutUrl === 'undefined');
          assert.strictEqual(updatedCheckout.webUrl, checkout.webUrl);
        });
      });
    });

    test('it appends _fd=0 to the checkout URL if it is not present', () => {
      return client.checkout.create({}).then((checkout) => {
        return client.checkout.fetch(checkout.id).then((updatedCheckout) => {
          const checkoutUrl = new URL(updatedCheckout.webUrl);

          assert.strictEqual(checkoutUrl.searchParams.get('_fd'), '0');
        });
      });
    });
  });

  suite('payload fields verification', () => {
    test('it returns all expected fields including price fields in a checkout with items', () => {
      const input = {
        lineItems: [
          {
            variantId: 'gid://shopify/ProductVariant/50850334310456',
            quantity: 1
          }
        ]
      };

      return client.checkout.create(input).then((checkout) => {
        assert.ok(checkout.lineItemsSubtotalPrice, 'lineItemsSubtotalPrice exists');
        assert.ok(checkout.lineItemsSubtotalPrice.amount, 'lineItemsSubtotalPrice.amount exists');
        assert.ok(checkout.lineItemsSubtotalPrice.currencyCode, 'lineItemsSubtotalPrice.currencyCode exists');

        assert.ok(checkout.subtotalPrice, 'subtotalPrice exists');
        assert.ok(checkout.subtotalPriceV2, 'subtotalPriceV2 exists');
        assert.strictEqual(checkout.subtotalPrice.amount, checkout.subtotalPriceV2.amount, 'subtotalPrice amount matches V2');
        assert.strictEqual(checkout.subtotalPrice.currencyCode, checkout.subtotalPriceV2.currencyCode, 'subtotalPrice currency matches V2');

        assert.ok(checkout.totalPrice, 'totalPrice exists');
        assert.ok(checkout.totalPriceV2, 'totalPriceV2 exists');
        assert.strictEqual(checkout.totalPrice.amount, checkout.totalPriceV2.amount, 'totalPrice amount matches V2');
        assert.strictEqual(checkout.totalPrice.currencyCode, checkout.totalPriceV2.currencyCode, 'totalPrice currency matches V2');

        assert.ok(checkout.totalTax, 'totalTax exists');
        assert.ok(checkout.totalTaxV2, 'totalTaxV2 exists');
        assert.strictEqual(checkout.totalTax.amount, checkout.totalTaxV2.amount, 'totalTax amount matches V2');
        assert.strictEqual(checkout.totalTax.currencyCode, checkout.totalTaxV2.currencyCode, 'totalTax currency matches V2');

        // Verify the UNSUPPORTED_FIELDS have expected values
        assert.strictEqual(checkout.completedAt, null, 'completedAt is null');
        assert.strictEqual(checkout.order, null, 'order is null');
        assert.strictEqual(checkout.orderStatusUrl, null, 'orderStatusUrl is null');
        assert.strictEqual(checkout.ready, false, 'ready is false');
        assert.strictEqual(checkout.requiresShipping, true, 'requiresShipping is true');
        assert.strictEqual(checkout.shippingLine, null, 'shippingLine is null');
        assert.strictEqual(checkout.taxExempt, false, 'taxExempt is false');
        assert.strictEqual(checkout.taxesIncluded, false, 'taxesIncluded is false');
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
          assert.strictEqual(updatedCheckout.note, input.note);
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
          assert.strictEqual(updatedCheckout.customAttributes[0].key, output.customAttributes[0].key);
          assert.strictEqual(updatedCheckout.customAttributes[0].value, output.customAttributes[0].value);
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
          assert.strictEqual(updatedCheckout.customAttributes[0].value, output.customAttributes[0].value);
          assert.strictEqual(updatedCheckout.customAttributes[1].value, output.customAttributes[1].value);
          assert.strictEqual(updatedCheckout.note, input.note);
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
          assert.strictEqual(updatedCheckout.id, checkout.id);
        });
      });
    });
  });

  suite('updateEmail', () => {
    test('it updates a checkout email via updateEmail', () => {
      const email = 'sdk@shopify.com';

      return client.checkout.create({}).then((checkout) => {
        return client.checkout.updateEmail(checkout.id, email).then((updatedCheckout) => {
          assert.strictEqual(updatedCheckout.email, email);
        });
      });
    });
  });

  suite('addLineItems', () => {
    test('it adds a line item to a checkout via addLineItems', () => {
      const input = {
        lineItems:
        {
          variantId: 'gid://shopify/ProductVariant/50850334310456',
          quantity: 1
        }
      };

      return client.checkout.create({}).then((checkout) => {
        return client.checkout.addLineItems(checkout.id, input.lineItems).then((updatedCheckout) => {
          assert.strictEqual(updatedCheckout.lineItems.length, 1);
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
          assert.strictEqual(updatedCheckout.lineItems.length, 2);
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
          assert.strictEqual(updatedCheckout.lineItems.length, 0);
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
        return client.checkout.removeLineItems(checkout.id, [checkout.lineItems[0].id, checkout.lineItems[1].id]).then((updatedCheckout) => {
          assert.strictEqual(updatedCheckout.lineItems.length, 0);
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
          assert.strictEqual(updatedCheckout.lineItems[0].variant.id, replacement.lineItems[0].variantId);
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
          assert.strictEqual(updatedCheckout.lineItems[0].quantity, updatedQuantity);
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
          assert.strictEqual(updatedCheckout.lineItems[0].quantity, 1);
          assert.strictEqual(updatedCheckout.lineItems[1].quantity, 1);
          assert.strictEqual(updatedCheckout.lineItems[0].customAttributes[0].key, customAttributes[0].key);
          assert.strictEqual(updatedCheckout.lineItems[1].customAttributes[0].value, customAttributes[0].value);
        });
      });
    });
  });

  suite('updateShippingAddress', () => {
    test('it updates the shipping address of a checkout via updateShippingAddress', () => {
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
          assert.strictEqual(updatedCheckout.shippingAddress.address1, input.shippingAddress.address1);
          assert.strictEqual(updatedCheckout.shippingAddress.address2, input.shippingAddress.address2);
          assert.strictEqual(updatedCheckout.shippingAddress.city, input.shippingAddress.city);
          assert.strictEqual(updatedCheckout.shippingAddress.company, input.shippingAddress.company);
          assert.strictEqual(updatedCheckout.shippingAddress.country, input.shippingAddress.country);
          assert.strictEqual(updatedCheckout.shippingAddress.firstName, input.shippingAddress.firstName);
          assert.strictEqual(updatedCheckout.shippingAddress.lastName, input.shippingAddress.lastName);
          assert.strictEqual(updatedCheckout.shippingAddress.phone, input.shippingAddress.phone);
          assert.strictEqual(updatedCheckout.shippingAddress.province, input.shippingAddress.province);
          assert.strictEqual(updatedCheckout.shippingAddress.zip, input.shippingAddress.zip);
        });
      });
    });

    test('it returns any user errors', () => {
      const inputWithHtmlTags = {
        shippingAddress: {
          address1: '<html>123 Oak St</html>',
          address2: '<script>Unit 2</script>',
          city: '<script>Ottawa</script>',
          company: '<script>Shopify</script>',
          country: '<script>Canada</script>',
          firstName: 'John',
          lastName: 'Doe',
          phone: '+16135551111',
          province: 'ON',
          zip: '123 ABC'
        }
      };

      return client.checkout.create({}).then((checkout) => {

        return client.checkout.updateShippingAddress(checkout.id, inputWithHtmlTags.shippingAddress).then((updatedCheckout) => {
          assert.deepStrictEqual(updatedCheckout.userErrors, [
            {
              code: 'INVALID',
              field: [
                'buyerIdentity',
                'deliveryAddressPreferences',
                '0',
                'deliveryAddress',
                'country'
              ],
              message: 'invalid value'
            }
          ]);
        });
      });
    });
  });
});
