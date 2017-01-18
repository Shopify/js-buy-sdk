import assert from 'assert';
import GraphQLJSClient from '@shopify/graphql-js-client';
import Config from '../src-graphql/config';
import Client from '../src-graphql/client';
import types from '../types';

suite('client-test', () => {

  test('it instantiates a GraphQL client with the given config', () => {
    let passedTypeBundle;
    let passedUrl;
    let passedFetchOptions;

    class FakeGraphQLJSClient {
      constructor(typeBundle, url, fetchOptions) {
        passedTypeBundle = typeBundle;
        passedUrl = url;
        passedFetchOptions = fetchOptions;
      }
    }

    const config = new Config({
      domain: 'sendmecats.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    new Client(config, FakeGraphQLJSClient);  // eslint-disable-line no-new

    assert.equal(passedTypeBundle, types);
    assert.equal(passedUrl, 'https://sendmecats.myshopify.com/api/graphql');
    assert.deepEqual(passedFetchOptions, {headers: `Authorization: Basic ${btoa('abc123')}`});
  });

  test('it creates an instance of the GraphQLJSClient by default', () => {
    const config = new Config({
      domain: 'sendmecats.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    assert.ok(GraphQLJSClient.prototype.isPrototypeOf(client.graphQLClient));
  });
});
