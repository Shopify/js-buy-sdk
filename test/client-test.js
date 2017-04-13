import assert from 'assert';
import GraphQLJSClient from '../src/graphql-client';
import Config from '../src/config';
import Client from '../src/client';
import types from '../types';
import singleProductFixture from '../fixtures/product-fixture';
import shopWithProductsFixture from '../fixtures/shop-with-products-fixture';
import shopWithCollectionsFixture from '../fixtures/shop-with-collections-fixture';
import singleCollectionFixture from '../fixtures/collection-fixture';
import dynamicProductFixture from '../fixtures/dynamic-product-fixture';
import dynamicCollectionFixture from '../fixtures/dynamic-collection-fixture';
import productWithPaginatedImagesFixture from '../fixtures/product-with-paginated-images-fixture';
import {secondPageImagesFixture, thirdPageImagesFixture, fourthPageImagesFixture, fifthPageImagesFixture} from '../fixtures/paginated-images-fixtures';
import productWithPaginatedVariantsFixture from '../fixtures/product-with-paginated-variants-fixture';
import {secondPageVariantsFixture, thirdPageVariantsFixture} from '../fixtures/paginated-variants-fixtures';
import queryProductFixture from '../fixtures/query-product-fixture';
import queryCollectionFixture from '../fixtures/query-collection-fixture';
import shopWithSortedProductsFixture from '../fixtures/shop-with-sorted-products-fixture';
import shopWithSortedCollectionsFixture from '../fixtures/shop-with-sorted-collections-fixture';
import fetchMock from './isomorphic-fetch-mock'; // eslint-disable-line import/no-unresolved
import productNodeQuery from '../src/product-node-query';
import imageQuery from '../src/image-query';
import imageConnectionQuery from '../src/image-connection-query';
import optionQuery from '../src/option-query';
import variantConnectionQuery from '../src/variant-connection-query';
import productConnectionQuery from '../src/product-connection-query';
import collectionConnectionQuery from '../src/collection-connection-query';
import collectionNodeQuery from '../src/collection-node-query';
import checkoutFixture from '../fixtures/checkout-fixture';
import checkoutCreateFixture from '../fixtures/checkout-create-fixture';
import checkoutWithPaginatedLineItemsFixture from '../fixtures/checkout-with-paginated-line-items-fixture';
import {secondPageLineItemsFixture, thirdPageLineItemsFixture} from '../fixtures/paginated-line-items-fixture';
import checkoutLineItemsAddFixture from '../fixtures/checkout-line-items-add-fixture';
import shopInfoFixture from '../fixtures/shop-info-fixture';
import shopPoliciesFixture from '../fixtures/shop-policies-fixture';
import checkoutLineItemsRemoveFixture from '../fixtures/checkout-line-items-remove-fixture';
import shopWithCollectionsWithProductsFixture from '../fixtures/shop-with-collections-with-products-fixture';
import collectionWithProductsFixture from '../fixtures/collection-with-products-fixture';
import shopWithCollectionsWithPaginationFixture from '../fixtures/shop-with-collections-with-pagination-fixture';
import checkoutLineItemsUpdateFixture from '../fixtures/checkout-line-items-update-fixture';

suite('client-test', () => {
  const querySplitter = /[\s,]+/;

  function tokens(query) {
    return query.split(querySplitter).filter((token) => Boolean(token));
  }

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

    return client.fetchProduct('7857989384', productNodeQuery(queryFields)).then((product) => {
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

    return client.fetchCollection('369312584', collectionNodeQuery(['title', 'updatedAt', ['image', imageQuery(['src'])]])).then((collection) => {
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

    return client.fetchProduct('7857989384', productNodeQuery(['id'])).then((product) => {
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

    return client.fetchProduct('7857989384', productNodeQuery([['images', imageConnectionQuery()]])).then((product) => {
      assert.equal(product.images.length, 0);
      assert.ok(fetchMock.done());
    });
  });

  test('it can fetch products with the query arg', () => {
    const config = new Config({
      domain: 'query-products.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    fetchMock.postOnce('https://query-products.myshopify.com/api/graphql', queryProductFixture);

    const query = {title: 'Cat', updatedAtMin: '2016-09-25T21:31:33', createdAtMin: '2016-09-25T21:31:33', productType: 'dog', limit: 10};

    return client.fetchQueryProducts(query, productConnectionQuery(['updatedAt', 'createdAt', 'productType', 'title'])).then((products) => {
      const [_arg, {body}] = fetchMock.lastCall('https://query-products.myshopify.com/api/graphql');
      const queryString = `query {
        shop {
          products (first: 10 query: "title:'Cat' updated_at:>='2016-09-25T21:31:33' created_at:>='2016-09-25T21:31:33' product_type:'dog'") {
            pageInfo {
              hasNextPage,
              hasPreviousPage
            },
            edges {
              cursor,
              node {
                id,
                updatedAt,
                createdAt,
                productType,
                title
              }
            }
          }
        }
      }`;

      assert.deepEqual(tokens(JSON.parse(body).query), tokens(queryString));
      assert.equal(products.length, 1);
      assert.equal(products[0].title, queryProductFixture.data.shop.products.edges[0].node.title);
      assert.equal(products[0].createdAt, queryProductFixture.data.shop.products.edges[0].node.createdAt);
      assert.equal(products[0].updatedAt, queryProductFixture.data.shop.products.edges[0].node.updatedAt);
      assert.equal(products[0].productType, queryProductFixture.data.shop.products.edges[0].node.productType);
      assert.ok(fetchMock.done());
    });
  });

  test('it can fetch collections with the query arg', () => {
    const config = new Config({
      domain: 'query-collections.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    fetchMock.postOnce('https://query-collections.myshopify.com/api/graphql', queryCollectionFixture);

    const query = {title: 'Cat Collection', updatedAtMin: '2016-09-25T21:31:33', limit: 10};

    return client.fetchQueryCollections(query, collectionConnectionQuery(['title', 'updatedAt'])).then((collections) => {
      const [_arg, {body}] = fetchMock.lastCall('https://query-collections.myshopify.com/api/graphql');
      const queryString = `query {
        shop {
          collections (first: 10 query: "title:'Cat Collection' updated_at:>='2016-09-25T21:31:33'") {
            pageInfo {
              hasNextPage,
              hasPreviousPage
            },
            edges {
              cursor,
              node {
                id,
                title,
                updatedAt
              }
            }
          }
        }
      }`;

      assert.deepEqual(tokens(JSON.parse(body).query), tokens(queryString));
      assert.equal(collections.length, 1);
      assert.equal(collections[0].title, queryCollectionFixture.data.shop.collections.edges[0].node.title);
      assert.equal(collections[0].updatedAt, queryCollectionFixture.data.shop.collections.edges[0].node.updatedAt);
      assert.ok(fetchMock.done());
    });
  });

  test('it can return queried products sorted', () => {
    const config = new Config({
      domain: 'sorted-query.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    fetchMock.postOnce('https://sorted-query.myshopify.com/api/graphql', shopWithSortedProductsFixture);

    return client.fetchQueryProducts({sortBy: 'updatedAt', sortDirection: 'desc'}, productConnectionQuery(['updatedAt'])).then((products) => {
      const [_arg, {body}] = fetchMock.lastCall('https://sorted-query.myshopify.com/api/graphql');
      const queryString = `query {
        shop {
          products (first: 20, sortKey: UPDATED_AT, reverse: true, query: "") {
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
            edges {
              cursor
              node {
                id
                updatedAt
              }
            }
          }
        }
      }`;

      assert.deepEqual(tokens(JSON.parse(body).query), tokens(queryString));
      assert.equal(products.length, 3);
      assert.equal(products[0].updatedAt, shopWithSortedProductsFixture.data.shop.products.edges[0].node.updatedAt);
      assert.equal(products[1].updatedAt, shopWithSortedProductsFixture.data.shop.products.edges[1].node.updatedAt);
      assert.equal(products[2].updatedAt, shopWithSortedProductsFixture.data.shop.products.edges[2].node.updatedAt);
    });
  });

  test('it can return queried collections sorted', () => {
    const config = new Config({
      domain: 'sorted-query.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    fetchMock.postOnce('https://sorted-query.myshopify.com/api/graphql', shopWithSortedCollectionsFixture);

    return client.fetchQueryCollections({sortBy: 'title'}, collectionConnectionQuery(['title'])).then((collections) => {
      const [_arg, {body}] = fetchMock.lastCall('https://sorted-query.myshopify.com/api/graphql');
      const queryString = `query {
        shop {
          collections (first: 20, sortKey: TITLE, query: "") {
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
            edges {
              cursor
              node {
                id
                title
              }
            }
          }
        }
      }`;

      assert.deepEqual(tokens(JSON.parse(body).query), tokens(queryString));
      assert.equal(collections.length, 3);
      assert.equal(collections[0].title, shopWithSortedCollectionsFixture.data.shop.collections.edges[0].node.title);
      assert.equal(collections[1].title, shopWithSortedCollectionsFixture.data.shop.collections.edges[1].node.title);
      assert.equal(collections[2].title, shopWithSortedCollectionsFixture.data.shop.collections.edges[2].node.title);
    });
  });

  test('it can create a checkout', () => {
    const config = new Config({
      domain: 'checkout.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    const input = {
      lineItems: [
        {variantId: 'gid://shopify/ProductVariant/1', quantity: 5, customAttributes: [{key: 'hi', value: 'bye'}]}
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

  test('it fetches all paginated line items on the checkout', () => {
    const config = new Config({
      domain: 'paginated-checkout.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    const input = {
      lineItems: [
        {variantId: 'gid://shopify/ProductVariant/1', quantity: 5, customAttributes: [{key: 'hi', value: 'bye'}]},
        {variantId: 'gid://shopify/ProductVariant/2', quantity: 10, customAttributes: [{key: 'bye', value: 'hi'}]},
        {variantId: 'gid://shopify/ProductVariant/3', quantity: 15, customAttributes: [{key: 'bing', value: 'bong'}]}
      ]
    };

    fetchMock.postOnce('https://paginated-checkout.myshopify.com/api/graphql', checkoutWithPaginatedLineItemsFixture)
      .postOnce('https://paginated-checkout.myshopify.com/api/graphql', secondPageLineItemsFixture)
      .postOnce('https://paginated-checkout.myshopify.com/api/graphql', thirdPageLineItemsFixture);

    return client.createCheckout(input).then((checkout) => {
      assert.equal(checkout.lineItems.length, 3, 'all three pages of line items are returned');
      assert.equal(checkout.lineItems[0].variant.id, checkoutWithPaginatedLineItemsFixture.data.checkoutCreate.checkout.lineItems.edges[0].node.variant.id);
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

    const checkoutId = 'gid://shopify/Checkout/89427726abd2543894550baae32065d6';
    const lineItems = [
      {variantId: 'gid://shopify/ProductVariant/2', quantity: 5, customAttributes: [{key: 'hi', value: 'bye'}]},
      {variantId: 'gid://shopify/ProductVariant/3', quantity: 5}
    ];

    fetchMock.postOnce('https://add-line-items.myshopify.com/api/graphql', checkoutLineItemsAddFixture);

    return client.addLineItems(checkoutId, lineItems).then((checkout) => {
      assert.equal(checkout.lineItems.length, 3, 'two more line items were added');
      assert.equal(checkout.id, 'gid://shopify/Checkout/89427726abd2543894550baae32065d6');
      assert.equal(checkout.lineItems[1].variant.id, 'gid://shopify/ProductVariant/2');
      assert.equal(checkout.lineItems[2].variant.id, 'gid://shopify/ProductVariant/3');
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
        {variantId: 'gid://shopify/ProductVariant/1234', quantity: 5}
      ]
    };

    fetchMock.postOnce('https://user-errors.myshopify.com/api/graphql', checkoutCreateWithUserErrorsFixture);

    return client.createCheckout(input).then(() => {
      assert.ok(false, 'Promise should not resolve');
    }).catch((error) => {
      assert.equal(error.message, '[{"message":"Variant is invalid","field":["lineItems","0","variantId"]}]');
    });
  });

  test('it can fetch shop information', () => {
    const config = new Config({
      domain: 'shop-info.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    fetchMock.postOnce('https://shop-info.myshopify.com/api/graphql', shopInfoFixture);

    return client.fetchShopInfo().then((shop) => {
      assert.equal(shop.name, shopInfoFixture.data.shop.name);
      assert.equal(shop.description, shopInfoFixture.data.shop.description);
      assert.ok(fetchMock.done());
    });
  });

  test('it can fetch shop policies', () => {
    const config = new Config({
      domain: 'shop-policies.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    fetchMock.postOnce('https://shop-policies.myshopify.com/api/graphql', shopPoliciesFixture);

    return client.fetchShopPolicies().then((shop) => {
      assert.equal(shop.privacyPolicy.id, shopPoliciesFixture.data.shop.privacyPolicy.id);
      assert.equal(shop.termsOfService.id, shopPoliciesFixture.data.shop.termsOfService.id);
      assert.equal(shop.refundPolicy.id, shopPoliciesFixture.data.shop.refundPolicy.id);
      assert.ok(fetchMock.done());
    });
  });

  test('it can fetch checkouts by id', () => {
    const config = new Config({
      domain: 'checkout.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    fetchMock.postOnce('https://checkout.myshopify.com/api/graphql', checkoutFixture);

    return client.fetchCheckout('7857989384').then((checkout) => {
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

    const checkoutId = 'gid://shopify/Checkout/dcf154c3feb78e585b9e88571cc383fa';
    const lineItemIds = ['gid://shopify/CheckoutLineItem/04f496222dd7fa7c01e3626a22d73094?checkout=dcf154c3feb78e585b9e88571cc383fa'];

    return client.removeLineItems(checkoutId, lineItemIds).then((checkout) => {
      assert.equal(checkout.lineItems.some((lineItem) => {
        return lineItem.id === 'gid://shopify/CheckoutLineItem/04f496222dd7fa7c01e3626a22d73094?checkout=dcf154c3feb78e585b9e88571cc383fa';
      }), false, 'the line item is removed');
    });
  });

  test('it can fetch all collections with products', () => {
    const config = new Config({
      domain: 'collections-with-products.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    fetchMock.postOnce('https://collections-with-products.myshopify.com/api/graphql', shopWithCollectionsWithProductsFixture);

    return client.fetchAllCollectionsWithProducts().then((collections) => {
      assert.ok(Array.isArray(collections), 'collections is an array');
      assert.equal(collections.length, 2, 'there are two collections');

      const [firstCollection, secondCollection] = collections;
      const [firstCollectionFixture, secondCollectionFixture] = shopWithCollectionsWithProductsFixture.data.shop.collections.edges;

      assert.equal(firstCollection.id, firstCollectionFixture.node.id);
      assert.equal(secondCollection.id, secondCollectionFixture.node.id);
      assert.equal(firstCollection.products.length, 2);
      assert.equal(secondCollection.products.length, 1);
      assert.ok(fetchMock.done());
    });
  });

  test('it can fetch a single collection with products', () => {
    const config = new Config({
      domain: 'collection-with-products.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    fetchMock.postOnce('https://collection-with-products.myshopify.com/api/graphql', collectionWithProductsFixture);

    return client.fetchCollectionWithProducts('369312584').then((collection) => {
      assert.equal(Array.isArray(collection), false, 'collection is not an array');
      assert.equal(collection.id, collectionWithProductsFixture.data.node.id);
      assert.equal(collection.products.length, 2);
      assert.ok(fetchMock.done());
    });
  });

  test('it paginates on images on products within collections', () => {
    const config = new Config({
      domain: 'collections-with-pagination.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    fetchMock.postOnce('https://collections-with-pagination.myshopify.com/api/graphql', shopWithCollectionsWithPaginationFixture)
      .postOnce('https://collections-with-pagination.myshopify.com/api/graphql', thirdPageImagesFixture)
      .postOnce('https://collections-with-pagination.myshopify.com/api/graphql', fourthPageImagesFixture)
      .postOnce('https://collections-with-pagination.myshopify.com/api/graphql', fifthPageImagesFixture);

    return client.fetchAllCollectionsWithProducts().then((collections) => {
      assert.equal(collections.length, 2);
      // Verify that all images are added
      assert.equal(collections[0].products[0].images.length, 2);
      assert.equal(collections[0].products[1].images.length, 2);
      assert.equal(collections[1].products[0].images.length, 2);
      assert.ok(fetchMock.done());
    });
  });

  test('it can update line items on a checkout', () => {
    const config = new Config({
      domain: 'update-line-items.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    fetchMock.postOnce('https://update-line-items.myshopify.com/api/graphql', checkoutLineItemsUpdateFixture);

    const checkoutId = 'gid://shopify/Checkout/e28b55a3205f8d129a9b7223287ec95a?key=191add76e8eba90b93cfe4d5d261c4cb';
    const lineItems = [
      {
        id: 'gid://shopify/CheckoutLineItem/fb71102f0d38de46e037b30f817e9db5?checkout=e28b55a3205f8d129a9b7223287ec95a',
        quantity: 2,
        variantId: 'gid://shopify/ProductVariant/36607672003'
      }
    ];

    return client.updateLineItems(checkoutId, lineItems).then((checkout) => {
      assert.equal(checkout.lineItems[0].id, checkoutLineItemsUpdateFixture.data.checkoutLineItemsUpdate.checkout.lineItems.edges[0].node.id);
      assert.equal(checkout.lineItems[0].quantity, 2);
      assert.equal(checkout.lineItems[0].variant.id, 'gid://shopify/ProductVariant/36607672003');
    });
  });
});
