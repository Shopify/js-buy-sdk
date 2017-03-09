import assert from 'assert';
import GraphQLJSClient from '@shopify/graphql-js-client';
import Config from '../src/config';
import Client from '../src/client';
import types from '../types';
import base64Encode from '../src/base64encode';
import singleProductFixture from '../fixtures/product-fixture';
import shopWithProductsFixture from '../fixtures/shop-with-products-fixture';
import shopWithCollectionsFixture from '../fixtures/shop-with-collections-fixture';
import singleCollectionFixture from '../fixtures/collection-fixture';
import dynamicProductFixture from '../fixtures/dynamic-product-fixture';
import dynamicCollectionFixture from '../fixtures/dynamic-collection-fixture';
import productWithPaginatedImagesFixture from '../fixtures/product-with-paginated-images-fixture';
import {secondPageImagesFixture, thirdPageImagesFixture} from '../fixtures/paginated-images-fixtures';
import productWithPaginatedVariantsFixture from '../fixtures/product-with-paginated-variants-fixture';
import {secondPageVariantsFixture, thirdPageVariantsFixture} from '../fixtures/paginated-variants-fixtures';
import fetchMock from './isomorphic-fetch-mock'; // eslint-disable-line import/no-unresolved
import productQuery from '../src/product-query';
import imageQuery from '../src/image-query';
import imageConnectionQuery from '../src/image-connection-query';
import optionQuery from '../src/option-query';
import variantConnectionQuery from '../src/variant-connection-query';
import collectionQuery from '../src/collection-query';

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

    fetchMock.postOnce('https://multiple-products.myshopify.com/api/graphql', shopWithProductsFixture);

    return client.fetchAllProducts().then((products) => {
      assert.ok(Array.isArray(products), 'products is an array');
      assert.equal(products.length, 2, 'there are two products');

      const [firstProduct, secondProduct] = products;
      const [firstProductFixture, secondProductFixture] = shopWithProductsFixture.data.shop.products.edges;

      assert.equal(firstProduct.id, firstProductFixture.node.id);
      assert.equal(secondProduct.id, secondProductFixture.node.id);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with a single product on Client#fetchProduct', () => {
    const config = new Config({
      domain: 'single-product.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    fetchMock.postOnce('https://single-product.myshopify.com/api/graphql', singleProductFixture);

    return client.fetchProduct('7857989384').then((product) => {
      assert.ok(Array.isArray(product) === false, 'product is not an array');
      assert.equal(product.id, singleProductFixture.data.node.id);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with an array of collections on Client#fetchAllCollections', () => {
    const config = new Config({
      domain: 'multiple-collections.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    fetchMock.postOnce('https://multiple-collections.myshopify.com/api/graphql', shopWithCollectionsFixture);

    return client.fetchAllCollections().then((collections) => {
      assert.ok(Array.isArray(collections), 'collections is an array');
      assert.equal(collections.length, 2, 'there are two collections');

      const [firstCollection, secondCollection] = collections;
      const [firstCollectionFixture, secondCollectionFixture] = shopWithCollectionsFixture.data.shop.collections.edges;

      assert.equal(firstCollection.id, firstCollectionFixture.node.id);
      assert.equal(secondCollection.id, secondCollectionFixture.node.id);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with a single collection on Client#fetchCollection', () => {
    const config = new Config({
      domain: 'single-collection.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    fetchMock.postOnce('https://single-collection.myshopify.com/api/graphql', singleCollectionFixture);

    return client.fetchCollection('369312584').then((collection) => {
      assert.ok(Array.isArray(collection) === false, 'collection is not an array');
      assert.equal(collection.id, singleCollectionFixture.data.node.id);
      assert.ok(fetchMock.done());
    });
  });

  test('it accepts product queries with dynamic fields', () => {
    const config = new Config({
      domain: 'dynamic-product-fields.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    fetchMock.postOnce('https://dynamic-product-fields.myshopify.com/api/graphql', dynamicProductFixture);

    const queryFields = ['id', 'handle', 'title', 'updatedAt', ['images', imageConnectionQuery(['id', 'src'])], ['options', optionQuery(['name'])], ['variants', variantConnectionQuery(['price', 'weight'])]];

    return client.fetchProduct('7857989384', productQuery(queryFields)).then((product) => {
      assert.ok(Array.isArray(product) === false, 'product is not an array');
      assert.equal(product.id, dynamicProductFixture.data.node.id);
      assert.equal(typeof product.createdAt, 'undefined', 'unspecified fields are not queried');
      assert.ok(fetchMock.done());
    });
  });

  test('it accepts collection queries with dynamic fields', () => {
    const config = new Config({
      domain: 'dynamic-collection-fields.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    fetchMock.postOnce('https://dynamic-collection-fields.myshopify.com/api/graphql', dynamicCollectionFixture);

    return client.fetchCollection('369312584', collectionQuery(['title', 'updatedAt', ['image', imageQuery(['src'])]])).then((collection) => {
      assert.ok(Array.isArray(collection) === false, 'collection is not an array');
      assert.equal(collection.updatedAt, dynamicCollectionFixture.data.node.updatedAt);
      assert.equal(typeof collection.id, 'undefined', 'unspecified fields are not queried');
      assert.ok(fetchMock.done());
    });
  });

  test('it fetches all images on products', () => {
    const config = new Config({
      domain: 'paginated-images.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    fetchMock.postOnce('https://paginated-images.myshopify.com/api/graphql', productWithPaginatedImagesFixture)
      .postOnce('https://paginated-images.myshopify.com/api/graphql', secondPageImagesFixture)
      .postOnce('https://paginated-images.myshopify.com/api/graphql', thirdPageImagesFixture);

    return client.fetchAllProducts().then((products) => {
      const images = products[0].images;

      assert.ok(Array.isArray(images), 'images is an array');
      // Each image page fixture only contains 1 image rather than 20 for simplicity
      assert.equal(images.length, 3, 'all three pages of images are returned');
      assert.equal(images[0].id, productWithPaginatedImagesFixture.data.shop.products.edges[0].node.images.edges[0].node.id);
      assert.equal(images[1].id, secondPageImagesFixture.data.node.images.edges[0].node.id);
      assert.equal(images[2].id, thirdPageImagesFixture.data.node.images.edges[0].node.id);
      assert.ok(fetchMock.done());
    });
  });

  test('it fetches all variants on products', () => {
    const config = new Config({
      domain: 'paginated-variants.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    fetchMock.postOnce('https://paginated-variants.myshopify.com/api/graphql', productWithPaginatedVariantsFixture)
      .postOnce('https://paginated-variants.myshopify.com/api/graphql', secondPageVariantsFixture)
      .postOnce('https://paginated-variants.myshopify.com/api/graphql', thirdPageVariantsFixture);

    return client.fetchProduct('7857989384').then((product) => {
      const variants = product.variants;

      assert.ok(Array.isArray(variants), 'variants is an array');
      // Each variant page fixture only contains 1 variant rather than 20 for simplicity
      assert.equal(variants.length, 3, 'all three pages of variants are returned');
      assert.equal(variants[0].id, productWithPaginatedVariantsFixture.data.node.variants.edges[0].node.id);
      assert.equal(variants[1].id, secondPageVariantsFixture.data.node.variants.edges[0].node.id);
      assert.equal(variants[2].id, thirdPageVariantsFixture.data.node.variants.edges[0].node.id);
      assert.ok(fetchMock.done());
    });
  });

  test('it does not fetch paginated images if images are not requested', () => {
    const config = new Config({
      domain: 'no-pagination.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    fetchMock.postOnce('https://no-pagination.myshopify.com/api/graphql', {data: {node: {id: 'gid://shopify/Product/7857989384'}}});

    return client.fetchProduct('7857989384', productQuery(['id'])).then((product) => {
      assert.equal(typeof product.images, 'undefined', 'images are not queried');
      assert.ok(fetchMock.done());
    });
  });

  test('it does not fetch paginated images if the images query result was empty', () => {
    const config = new Config({
      domain: 'no-pagination.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    fetchMock.postOnce('https://no-pagination.myshopify.com/api/graphql', {data: {node: {images: {edges: [], pageInfo: {hasNextPage: false, hasPreviousPage: false}}}}});

    return client.fetchProduct('7857989384', productQuery([['images', imageConnectionQuery()]])).then((product) => {
      assert.equal(product.images.length, 0);
      assert.ok(fetchMock.done());
    });
  });
});
