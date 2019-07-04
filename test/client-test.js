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
    assert.equal(passedUrl, 'https://sendmecats.myshopify.com/api/2019-07/graphql');
    assert.deepEqual(passedFetcherOptions, {
      headers: {
        'X-SDK-Variant': 'javascript',
        'X-SDK-Version': version,
        'X-Shopify-Storefront-Access-Token': config.storefrontAccessToken
      }
    });
  });

  test('it creates a fetcher from the fetch function provided', () => {
    let passedFetcher;
    let passedUrl;
    let passedBody;
    let passedMethod;
    let passedMode;
    let passedHeaders;

    class FakeGraphQLJSClient {
      constructor(typeBundle, {fetcher}) {
        passedFetcher = fetcher;
      }
    }

    function fetchFunction(url, {body, method, mode, headers}) {
      passedUrl = url;
      passedBody = body;
      passedMethod = method;
      passedMode = mode;
      passedHeaders = headers;

      return Promise.resolve({json: () => {}}); // eslint-disable-line no-empty-function
    }

    new Client(new Config(config), FakeGraphQLJSClient, fetchFunction); // eslint-disable-line no-new

    return passedFetcher({data: 'body'}).then(() => {
      assert.equal(passedUrl, 'https://sendmecats.myshopify.com/api/2019-07/graphql');
      assert.equal(passedBody, JSON.stringify({data: 'body'}));
      assert.equal(passedMethod, 'POST');
      assert.equal(passedMode, 'cors');
      assert.deepEqual(passedHeaders, {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-SDK-Variant': 'javascript',
        'X-SDK-Version': version,
        'X-Shopify-Storefront-Access-Token': config.storefrontAccessToken
      });
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
