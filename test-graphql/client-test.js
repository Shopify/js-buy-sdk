import assert from 'assert';
import GraphQLJSClient from '@shopify/graphql-js-client';
import Config from '../src-graphql/config';
import Client from '../src-graphql/client';
import types from '../types';
import base64Encode from '../src-graphql/base64encode';
import singleProductFixture from '../fixtures/product-fixture';
import shopWithProductsFixture from '../fixtures/shop-with-products-fixture';
import shopWithCollectionsFixture from '../fixtures/shop-with-collections-fixture';
import singleCollectionFixture from '../fixtures/collection-fixture';
import dynamicProductFixture from '../fixtures/dynamic-product-fixture';
import dynamicCollectionFixture from '../fixtures/dynamic-collection-fixture';
import fetchMock from './isomorphic-fetch-mock'; // eslint-disable-line import/no-unresolved
import productQuery from '../src-graphql/product-query';
import imageQuery from '../src-graphql/image-query';
import optionQuery from '../src-graphql/option-query';
import variantQuery from '../src-graphql/variant-query';
import collectionQuery from '../src-graphql/collection-query';

suite('client-test', () => {
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

    assert.equal(passedTypeBundle, types);
    assert.equal(passedUrl, 'https://sendmecats.myshopify.com/api/graphql');
    assert.deepEqual(passedFetcherOptions, {
      headers: {
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

  test('it resolves with an array of products on Client#fetchAllProducts', () => {
    const config = new Config({
      domain: 'multiple-products.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    fetchMock.post('https://multiple-products.myshopify.com/api/graphql', shopWithProductsFixture);

    return client.fetchAllProducts().then((products) => {
      assert.ok(Array.isArray(products), 'products is an array');
      assert.equal(products.length, 2, 'there are two products');

      const [firstProduct, secondProduct] = products;
      const [firstProductFixture, secondProductFixture] = shopWithProductsFixture.data.shop.products.edges;

      assert.equal(firstProduct.id, firstProductFixture.node.id);
      assert.equal(secondProduct.id, secondProductFixture.node.id);
    });
  });

  test('it resolves with a single product on Client#fetchProduct', () => {
    const config = new Config({
      domain: 'single-product.myshopify.com',
      storefrontAccessToken: '0dc0448815bdf506934101c6d39ec244'
    });

    const client = new Client(config);

    fetchMock.post('https://single-product.myshopify.com/api/graphql', singleProductFixture);

    return client.fetchProduct('7857989384').then((product) => {
      assert.ok(Array.isArray(product) === false, 'product is not an array');
      assert.equal(product.id, singleProductFixture.data.product.id);
    });
  });

  test('it resolves with an array of collections on Client#fetchAllCollections', () => {
    const config = new Config({
      domain: 'multiple-collections.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    fetchMock.post('https://multiple-collections.myshopify.com/api/graphql', shopWithCollectionsFixture);

    return client.fetchAllCollections().then((collections) => {
      assert.ok(Array.isArray(collections), 'collections is an array');
      assert.equal(collections.length, 2, 'there are two collections');

      const [firstCollection, secondCollection] = collections;
      const [firstCollectionFixture, secondCollectionFixture] = shopWithCollectionsFixture.data.shop.collections.edges;

      assert.equal(firstCollection.id, firstCollectionFixture.node.id);
      assert.equal(secondCollection.id, secondCollectionFixture.node.id);
    });
  });

  test('it resolves with a single collection on Client#fetchCollection', () => {
    const config = new Config({
      domain: 'single-collection.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    fetchMock.post('https://single-collection.myshopify.com/api/graphql', singleCollectionFixture);

    return client.fetchCollection('369312584').then((collection) => {
      assert.ok(Array.isArray(collection) === false, 'collection is not an array');
      assert.equal(collection.id, singleCollectionFixture.data.collection.id);
    });
  });

  test('it accepts product queries with dynamic fields', () => {
    const config = new Config({
      domain: 'dynamic-product-fields.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    fetchMock.post('https://dynamic-product-fields.myshopify.com/api/graphql', dynamicProductFixture);

    return client.fetchProduct('7857989384', productQuery(['id', 'handle', 'title', 'updatedAt', ['images', imageQuery(['id', 'src'])],
      ['options', optionQuery(['name'])], ['variants', variantQuery(['price', 'weight'])]])).then((product) => {
        assert.ok(Array.isArray(product) === false, 'product is not an array');
        assert.equal(product.id, dynamicProductFixture.data.product.id);
        assert.ok(typeof product.createdAt === 'undefined', 'unspecified fields are not queried');
      });
  });

  test('it accepts collection queries with dynamic fields', () => {
    const config = new Config({
      domain: 'dynamic-collection-fields.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    fetchMock.post('https://dynamic-collection-fields.myshopify.com/api/graphql', dynamicCollectionFixture);

    return client.fetchCollection('369312584', collectionQuery(['title', 'updatedAt', ['image', imageQuery(['src'])]])).then((collection) => {
      assert.ok(Array.isArray(collection) === false, 'collection is not an array');
      assert.equal(collection.updatedAt, dynamicCollectionFixture.data.collection.updatedAt);
      assert.ok(typeof collection.id === 'undefined', 'unspecified fields are not queried');
    });
  });
});
