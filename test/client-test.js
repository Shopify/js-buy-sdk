import assert from 'assert';
import GraphQLJSClient from '../src/graphql-client';
import Config from '../src/config';
import Client from '../src/client';
import types from '../schema.json';
import fetchMock from './isomorphic-fetch-mock'; // eslint-disable-line import/no-unresolved
import checkoutFixture from '../fixtures/checkout-fixture';
import checkoutCreateFixture from '../fixtures/checkout-create-fixture';
import checkoutWithPaginatedLineItemsFixture from '../fixtures/checkout-with-paginated-line-items-fixture';
import checkoutCreateWithPaginatedLineItemsFixture from '../fixtures/checkout-create-with-paginated-line-items-fixture';
import {secondPageLineItemsFixture, thirdPageLineItemsFixture} from '../fixtures/paginated-line-items-fixture';
import checkoutLineItemsAddFixture from '../fixtures/checkout-line-items-add-fixture';
import checkoutLineItemsRemoveFixture from '../fixtures/checkout-line-items-remove-fixture';
import checkoutLineItemsUpdateFixture from '../fixtures/checkout-line-items-update-fixture';
import {version} from '../package.json';

suite('client-test', () => {
  teardown(() => {
    fetchMock.restore();
  });

  test('it instantiates a GraphQL client with the given config', () => {
    let passedTypeBundle;
    let passedUrl;
    let passedFetcherOptions;

    class FakeGraphQLJSClient {
      constructor(typeBundle, {url, fetcherOptions}) {
        passedTypeBundle = typeBundle;
        passedUrl = url;
        passedFetcherOptions = fetcherOptions;
      }
    }

    const config = new Config({
      domain: 'sendmecats.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    new Client(config, FakeGraphQLJSClient); // eslint-disable-line no-new

    assert.deepEqual(passedTypeBundle, types);
    assert.equal(passedUrl, 'https://sendmecats.myshopify.com/api/graphql');
    assert.deepEqual(passedFetcherOptions, {
      headers: {
        'X-SDK-Variant': 'javascript',
        'X-SDK-Version': version,
        'X-Shopify-Storefront-Access-Token': config.storefrontAccessToken
      }
    });
  });

  test('it creates an instance of the GraphQLJSClient by default', () => {
    const config = new Config({
      domain: 'sendmecats.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    assert.ok(GraphQLJSClient.prototype.isPrototypeOf(client.graphQLClient));
  });



  test('it can create a checkout', () => {
    const config = new Config({
      domain: 'checkout.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    const input = {
      lineItems: [
        {variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8yOTEwNjA2NDU4NA==', quantity: 5, customAttributes: [{key: 'hi', value: 'bye'}]}
      ],
      shippingAddress: {
        address1: '123 Cat Road',
        city: 'Cat Land',
        company: 'Catmart',
        country: 'Canada',
        firstName: 'Meow',
        lastName: 'Meowington',
        phone: '4161234566',
        province: 'ON',
        zip: 'M3O 0W1'
      }
    };

    fetchMock.postOnce('https://checkout.myshopify.com/api/graphql', checkoutCreateFixture);

    return client.createCheckout(input).then((checkout) => {
      assert.equal(checkout.id, checkoutCreateFixture.data.checkoutCreate.checkout.id);
      assert.equal(checkout.lineItems[0].title, 'Intelligent Granite Table');
      assert.equal(checkout.lineItems[0].quantity, 5);
      assert.equal(checkout.shippingAddress.address1, '123 Cat Road');
      assert.ok(fetchMock.done());
    });
  });

  test('it fetches all paginated line items on the checkout on a mutation', () => {
    const config = new Config({
      domain: 'paginated-checkout.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    const input = {
      lineItems: [
        {variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8yOTEwNjA2NDU4NA==', quantity: 5, customAttributes: [{key: 'hi', value: 'bye'}]},
        {variantId: 'ZNc0vnIOijnJabh4873nNQnfb9B0QhnFyvk9Wfh87oNBeqBHGQNA5a==', quantity: 10, customAttributes: [{key: 'bye', value: 'hi'}]},
        {variantId: 'Zad7JHnbf32JHna087juBQn8faB84Ba28VnqjF87Qynaw8MnDhNA3W==', quantity: 15, customAttributes: [{key: 'bing', value: 'bong'}]}
      ]
    };

    fetchMock.postOnce('https://paginated-checkout.myshopify.com/api/graphql', checkoutCreateWithPaginatedLineItemsFixture)
      .postOnce('https://paginated-checkout.myshopify.com/api/graphql', secondPageLineItemsFixture)
      .postOnce('https://paginated-checkout.myshopify.com/api/graphql', thirdPageLineItemsFixture);

    return client.createCheckout(input).then((checkout) => {
      assert.equal(checkout.lineItems.length, 3, 'all three pages of line items are returned');
      assert.equal(checkout.lineItems[0].variant.id, checkoutCreateWithPaginatedLineItemsFixture.data.checkoutCreate.checkout.lineItems.edges[0].node.variant.id);
      assert.equal(checkout.lineItems[1].variant.id, secondPageLineItemsFixture.data.node.lineItems.edges[0].node.variant.id);
      assert.equal(checkout.lineItems[2].variant.id, thirdPageLineItemsFixture.data.node.lineItems.edges[0].node.variant.id);
      assert.ok(fetchMock.done());
    });
  });

  test('it fetches all paginated line items on the checkout', () => {
    const config = new Config({
      domain: 'paginated-checkout.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    fetchMock.postOnce('https://paginated-checkout.myshopify.com/api/graphql', checkoutWithPaginatedLineItemsFixture)
      .postOnce('https://paginated-checkout.myshopify.com/api/graphql', secondPageLineItemsFixture)
      .postOnce('https://paginated-checkout.myshopify.com/api/graphql', thirdPageLineItemsFixture);

    return client.fetchCheckout('Z2lkOi8vc2hvcGlmeS9DaGVja291dC9lM2JkNzFmNzI0OGM4MDZmMzM3MjVhNTNlMzM5MzFlZj9rZXk9NDcwOTJlNDQ4NTI5MDY4ZDFiZTUyZTUwNTE2MDNhZjg=').then((checkout) => {
      assert.equal(checkout.lineItems.length, 3, 'all three pages of line items are returned');
      assert.equal(checkout.lineItems[0].variant.id, checkoutWithPaginatedLineItemsFixture.data.node.lineItems.edges[0].node.variant.id);
      assert.equal(checkout.lineItems[1].variant.id, secondPageLineItemsFixture.data.node.lineItems.edges[0].node.variant.id);
      assert.equal(checkout.lineItems[2].variant.id, thirdPageLineItemsFixture.data.node.lineItems.edges[0].node.variant.id);
      assert.ok(fetchMock.done());
    });
  });

  test('it can add line items to a checkout', () => {
    const config = new Config({
      domain: 'add-line-items.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9lM2JkNzFmNzI0OGM4MDZmMzM3MjVhNTNlMzM5MzFlZj9rZXk9NDcwOTJlNDQ4NTI5MDY4ZDFiZTUyZTUwNTE2MDNhZjg=';
    const lineItems = [
      {variantId: 'ZNc0vnIOijnJabh4873nNQnfb9B0QhnFyvk9Wfh87oNBeqBHGQNA5a==', quantity: 5, customAttributes: [{key: 'hi', value: 'bye'}]},
      {variantId: 'Zad7JHnbf32JHna087juBQn8faB84Ba28VnqjF87Qynaw8MnDhNA3W==', quantity: 5}
    ];

    fetchMock.postOnce('https://add-line-items.myshopify.com/api/graphql', checkoutLineItemsAddFixture);

    return client.addLineItems(checkoutId, lineItems).then((checkout) => {
      assert.equal(checkout.lineItems.length, 3, 'two more line items were added');
      assert.equal(checkout.id, 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9lM2JkNzFmNzI0OGM4MDZmMzM3MjVhNTNlMzM5MzFlZj9rZXk9NDcwOTJlNDQ4NTI5MDY4ZDFiZTUyZTUwNTE2MDNhZjg=');
      assert.equal(checkout.lineItems[1].variant.id, 'ZNc0vnIOijnJabh4873nNQnfb9B0QhnFyvk9Wfh87oNBeqBHGQNA5a==');
      assert.equal(checkout.lineItems[2].variant.id, 'Zad7JHnbf32JHna087juBQn8faB84Ba28VnqjF87Qynaw8MnDhNA3W==');
      assert.ok(fetchMock.done());
    });
  });

  test('it rejects the promise if there are user errors', () => {
    const checkoutCreateWithUserErrorsFixture = {
      data: {
        checkoutCreate: {
          userErrors: [
            {
              message: 'Variant is invalid',
              field: [
                'lineItems',
                '0',
                'variantId'
              ]
            }
          ],
          checkout: null
        }
      }
    };

    const config = new Config({
      domain: 'user-errors.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    const input = {
      lineItems: [
        {variantId: 'invalidId', quantity: 5}
      ]
    };

    fetchMock.postOnce('https://user-errors.myshopify.com/api/graphql', checkoutCreateWithUserErrorsFixture);

    return client.createCheckout(input).then(() => {
      assert.ok(false, 'Promise should not resolve');
    }).catch((error) => {
      assert.equal(error.message, '[{"message":"Variant is invalid","field":["lineItems","0","variantId"]}]');
    });
  });


  test('it can update line items on a checkout', () => {
    const config = new Config({
      domain: 'update-line-items.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    fetchMock.postOnce('https://update-line-items.myshopify.com/api/graphql', checkoutLineItemsUpdateFixture);

    const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9lM2JkNzFmNzI0OGM4MDZmMzM3MjVhNTNlMzM5MzFlZj9rZXk9NDcwOTJlNDQ4NTI5MDY4ZDFiZTUyZTUwNTE2MDNhZjg=';
    const lineItems = [
      {
        id: 'zUzNzQ1ZjU0OTVlZjIyYzIxYzVkZj9rZXk9MTlkMjljZDgwYjg3MGMxNmRmNjNjM2JjODUzYjY3MTY=',
        quantity: 2,
        variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8yOTEwNjA2NDU4NA=='
      }
    ];

    return client.updateLineItems(checkoutId, lineItems).then((checkout) => {
      assert.equal(checkout.lineItems[0].id, checkoutLineItemsUpdateFixture.data.checkoutLineItemsUpdate.checkout.lineItems.edges[0].node.id);
      assert.equal(checkout.lineItems[0].quantity, 2);
      assert.equal(checkout.lineItems[0].variant.id, 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8yOTEwNjA2NDU4NA==');
    });
  });

  test('it can fetch checkouts by id', () => {
    const config = new Config({
      domain: 'checkout.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    fetchMock.postOnce('https://checkout.myshopify.com/api/graphql', checkoutFixture);

    return client.fetchCheckout('Z2lkOi8vc2hvcGlmeS9DaGVja291dC9lM2JkNzFmNzI0OGM4MDZmMzM3MjVhNTNlMzM5MzFlZj9rZXk9NDcwOTJlNDQ4NTI5MDY4ZDFiZTUyZTUwNTE2MDNhZjg=').then((checkout) => {
      assert.equal(checkout.id, checkoutFixture.data.node.id);
      assert.ok(fetchMock.done());
    });
  });

  test('it can remove line items from checkout', () => {
    const config = new Config({
      domain: 'remove-line-items.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    fetchMock.postOnce('https://remove-line-items.myshopify.com/api/graphql', checkoutLineItemsRemoveFixture);

    const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9lM2JkNzFmNzI0OGM4MDZmMzM3MjVhNTNlMzM5MzFlZj9rZXk9NDcwOTJlNDQ4NTI5MDY4ZDFiZTUyZTUwNTE2MDNhZjg=';
    const lineItemIds = ['zUzNzQ1ZjU0OTVlZjIyYzIxYzVkZj9rZXk9MTlkMjljZDgwYjg3MGMxNmRmNjNjM2JjODUzYjY3MTY='];

    return client.removeLineItems(checkoutId, lineItemIds).then((checkout) => {
      assert.equal(checkout.lineItems.some((lineItem) => {
        return lineItem.id === 'zUzNzQ1ZjU0OTVlZjIyYzIxYzVkZj9rZXk9MTlkMjljZDgwYjg3MGMxNmRmNjNjM2JjODUzYjY3MTY=';
      }), false, 'the line item is removed');
    });
  });

  test('it has static helpers', () => {
    assert.ok(Client.Product.Helpers);
    assert.ok(Client.Image.Helpers);
  });
});
