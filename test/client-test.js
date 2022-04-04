import assert from 'assert';
import GraphQLJSClient from '../src/graphql-client';
import Config from '../src/config';
import Client from '../src/client';
import types from '../schema.json';
import {version} from '../package.json';

suite('client-test', () => {
  const config = {
    domain: 'sendmecats.myshopify.com',
    storefrontAccessToken: 'abc123',
    apiVersion: '2022-04'
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
    assert.equal(passedUrl, `https://${config.domain}/api/${config.apiVersion}/graphql`);
    assert.deepEqual(passedFetcherOptions, {
      headers: {
        'Accept-Language': '*',
        'X-SDK-Variant': 'javascript',
        'X-SDK-Version': version,
        'X-Shopify-Storefront-Access-Token': config.storefrontAccessToken
      }
    });
  });

  test('it instantiates a GraphQL client with the given config and custom source header when source config is provided', () => {
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

    const withSourceConfig = Object.assign({}, config, {
      source: 'buy-button-js'
    });

    new Client(new Config(withSourceConfig), FakeGraphQLJSClient); // eslint-disable-line no-new

    assert.deepEqual(passedTypeBundle, types);
    assert.equal(passedUrl, `https://${withSourceConfig.domain}/api/${withSourceConfig.apiVersion}/graphql`);
    assert.deepEqual(passedFetcherOptions, {
      headers: {
        'Accept-Language': '*',
        'X-SDK-Variant': 'javascript',
        'X-SDK-Version': version,
        'X-Shopify-Storefront-Access-Token': withSourceConfig.storefrontAccessToken,
        'X-SDK-Variant-Source': withSourceConfig.source
      }
    });
  });

  test('it instantiates a GraphQL client with the given config and language header when a language config is provided', () => {
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

    const withLanguageConfig = Object.assign({}, config, {
      language: 'ja-JP'
    });

    new Client(new Config(withLanguageConfig), FakeGraphQLJSClient); // eslint-disable-line no-new

    assert.deepEqual(passedTypeBundle, types);
    assert.equal(passedUrl, `https://${withLanguageConfig.domain}/api/${withLanguageConfig.apiVersion}/graphql`);
    assert.deepEqual(passedFetcherOptions, {
      headers: {
        'X-SDK-Variant': 'javascript',
        'X-SDK-Version': version,
        'X-Shopify-Storefront-Access-Token': withLanguageConfig.storefrontAccessToken,
        'Accept-Language': withLanguageConfig.language
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
      assert.equal(passedUrl, `https://${config.domain}/api/${config.apiVersion}/graphql`);
      assert.equal(passedBody, JSON.stringify({data: 'body'}));
      assert.equal(passedMethod, 'POST');
      assert.equal(passedMode, 'cors');
      assert.deepEqual(passedHeaders, {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Accept-Language': '*',
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
