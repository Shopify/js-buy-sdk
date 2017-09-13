import assert from 'assert';
import GraphQLJSClient from '../src/graphql-client';
import Config from '../src/config';
import Client from '../src/client';
import types from '../schema.json';
import {version} from '../package.json';

suite('client-test', () => {
  const config = {
    domain: 'sendmecats.myshopify.com',
    storefrontAccessToken: 'abc123'
  };

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

    new Client(new Config(config), FakeGraphQLJSClient); // eslint-disable-line no-new

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
    const client = Client.buildClient(config);

    assert.ok(GraphQLJSClient.prototype.isPrototypeOf(client.graphQLClient));
  });

  test('it has static helpers', () => {
    const client = Client.buildClient(config);

    assert.ok(client.product.helpers);
    assert.ok(client.image.helpers);
  });
});
