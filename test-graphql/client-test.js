import assert from 'assert';
import GraphQLJSClient from '@shopify/graphql-js-client';
import Config from '../src-graphql/config';
import Client from '../src-graphql/client';
import types from '../types';
import base64Encode from '../src-graphql/base64encode';
import {singleProductFixture, multipleProductsFixture} from '../fixtures/product-fixture';
import {fetchMock} from './fetch-mock-node';

suite('client-test', () => {
  const querySplitter = /[\s,]+/;

  function tokens(queryString) {
    return queryString.split(querySplitter).filter((token) => Boolean(token));
  }

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

    new Client(config, FakeGraphQLJSClient);  // eslint-disable-line no-new

    assert.equal(passedTypeBundle, types);
    assert.equal(passedUrl, 'https://sendmecats.myshopify.com/api/graphql');
    assert.deepEqual(passedFetcherOptions, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${base64Encode(config.storefrontAccessToken)}`
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

  test('it resolves with an array of products on Client#fetchAll', () => {
    const config = new Config({
      domain: 'multiple-products.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    fetchMock.post('https://multiple-products.myshopify.com/api/graphql', multipleProductsFixture);

    return client.fetchAllProducts().then((products) => {
      assert.ok(Array.isArray(products), 'products is an array');
      assert.equal(products.length, 2, 'there are two products');

      const passedArgs = fetchMock.lastCall('https://multiple-products.myshopify.com/api/graphql');

      const passedQuery = JSON.parse(passedArgs[1].body).query;

      assert.deepEqual(tokens(passedQuery.toString()), tokens(
      `query {
        shop {
          products (first: 10) {
            pageInfo {
             hasNextPage
             hasPreviousPage
            }
            edges {
              cursor
              node {
                id
                createdAt
                updatedAt
                bodyHtml
                handle
                productType
                title
                vendor
                tags
                publishedAt
                images (first: 10) {
                  pageInfo {
                    hasNextPage
                    hasPreviousPage
                  }
                  edges {
                    cursor
                    node {
                      id
                      src
                      altText
                    }
                  }
                }
                options {
                  id
                  name
                  values
                }
                variants (first: 10) {
                  pageInfo {
                    hasNextPage
                    hasPreviousPage
                  }
                  edges {
                    cursor
                    node {
                      id
                      title
                      selectedOptions {
                        name
                        value
                      }
                      price
                      weight
                    }
                  }
                }
              }
            }
          }
        }
      }`));
    });
  });

  test('it resolves with a single product on Client#fetch', () => {
    const config = new Config({
      domain: 'single-product.myshopify.com',
      storefrontAccessToken: '0dc0448815bdf506934101c6d39ec244'
    });

    const client = new Client(config);

    fetchMock.post('https://single-product.myshopify.com/api/graphql', singleProductFixture);

    return client.fetchProduct('7857989384').then((product) => {
      assert.ok(Array.isArray(product) === false, 'products is not an array');

      const passedArgs = fetchMock.lastCall('https://single-product.myshopify.com/api/graphql');

      const passedQuery = JSON.parse(passedArgs[1].body).query;

      assert.deepEqual(tokens(passedQuery.toString()), tokens(
      `query {
        product (id: "gid://shopify/Product/7857989384") {
          id
          createdAt
          updatedAt
          bodyHtml
          handle
          productType
          title
          vendor
          tags
          publishedAt
          images (first: 10) {
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
            edges {
              cursor
              node {
                id
                src
                altText
              }
            }
          }
          options {
            id
            name
            values
          }
          variants (first: 10) {
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
            edges {
              cursor
              node {
                id
                title
                selectedOptions {
                  name
                  value
                }
                price
                weight
              }
            }
          }
        }
      }`));
    });
  });
});

