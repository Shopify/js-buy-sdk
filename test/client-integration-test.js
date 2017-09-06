import assert from 'assert';
import Client from '../src/client';
import fetchMock from './isomorphic-fetch-mock'; // eslint-disable-line import/no-unresolved

// fixtures
import shopWithProductsFixture from '../fixtures/shop-with-products-fixture';
import singleProductFixture from '../fixtures/product-fixture';
import shopWithCollectionsFixture from '../fixtures/shop-with-collections-fixture';
import singleCollectionFixture from '../fixtures/collection-fixture';
import productWithPaginatedImagesFixture from '../fixtures/product-with-paginated-images-fixture';
import {secondPageImagesFixture, thirdPageImagesFixture, fourthPageImagesFixture, fifthPageImagesFixture} from '../fixtures/paginated-images-fixtures';
import productWithPaginatedVariantsFixture from '../fixtures/product-with-paginated-variants-fixture';
import {secondPageVariantsFixture, thirdPageVariantsFixture} from '../fixtures/paginated-variants-fixtures';
import productByHandleFixture from '../fixtures/product-by-handle-fixture';
import collectionByHandleFixture from '../fixtures/collection-by-handle-fixture';
import collectionWithProductsFixture from '../fixtures/collection-with-products-fixture';
import shopWithCollectionsWithPaginationFixture from '../fixtures/shop-with-collections-with-pagination-fixture';
import shopWithCollectionsWithProductsFixture from '../fixtures/shop-with-collections-with-products-fixture';
import shopInfoFixture from '../fixtures/shop-info-fixture';
import shopPoliciesFixture from '../fixtures/shop-policies-fixture';

suite('client-integration-test', () => {
  const domain = 'client-integration-tests.myshopify.io';
  const apiUrl = `https://${domain}/api/graphql`;
  const config = {
    storefrontAccessToken: 'abc123',
    domain
  };
  let client;

  setup(() => {
    client = Client.buildClient(config);
    fetchMock.reset();
  });

  teardown(() => {
    client = null;
    fetchMock.restore();
  });

  test('it resolves with an array of products on Client#fetchAllProducts', () => {
    fetchMock.postOnce(apiUrl, shopWithProductsFixture);

    return client.fetchAllProducts().then((products) => {
      assert.ok(Array.isArray(products), 'products is an array');
      assert.equal(products.length, 2, 'there are two products');

      assert.equal(products[0].id, shopWithProductsFixture.data.shop.products.edges[0].node.id);
      assert.equal(products[1].id, shopWithProductsFixture.data.shop.products.edges[1].node.id);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with a single product on Client#fetchProduct', () => {
    fetchMock.postOnce(apiUrl, singleProductFixture);

    const id = singleProductFixture.data.node.id;

    return client.fetchProduct(id).then((product) => {
      assert.ok(!Array.isArray(product), 'product is not an array');
      assert.equal(product.id, id);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with an array of collections on Client#fetchAllCollections', () => {
    fetchMock.postOnce(apiUrl, shopWithCollectionsFixture);

    return client.fetchAllCollections().then((collections) => {
      assert.ok(Array.isArray(collections), 'collections is an array');
      assert.equal(collections.length, 2, 'there are two collections');

      assert.equal(collections[0].id, shopWithCollectionsFixture.data.shop.collections.edges[0].node.id);
      assert.equal(collections[1].id, shopWithCollectionsFixture.data.shop.collections.edges[1].node.id);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with a single collection on Client#fetchCollection', () => {
    fetchMock.postOnce(apiUrl, singleCollectionFixture);

    const id = singleCollectionFixture.data.node.id;

    return client.fetchCollection(id).then((collection) => {
      assert.ok(Array.isArray(collection) === false, 'collection is not an array');
      assert.equal(collection.id, id);
      assert.ok(fetchMock.done());
    });
  });

  test('it fetches all images on products on Client#fetchAllProducts', () => {
    fetchMock.postOnce(apiUrl, productWithPaginatedImagesFixture)
      .postOnce(apiUrl, secondPageImagesFixture)
      .postOnce(apiUrl, thirdPageImagesFixture);

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

  test('it fetches all variants on Client#fetchProduct', () => {
    fetchMock.postOnce(apiUrl, productWithPaginatedVariantsFixture)
      .postOnce(apiUrl, secondPageVariantsFixture)
      .postOnce(apiUrl, thirdPageVariantsFixture);

    return client.fetchProduct(productWithPaginatedVariantsFixture.data.node.id).then((product) => {
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

  test('it does not fetch paginated images if the images query result was empty on Client#fetchProduct', () => {
    fetchMock.postOnce(apiUrl, {
      data: {
        node: {
          images: {
            edges: [],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false
            }
          }
        }
      }
    });

    return client.fetchProduct('an-id').then((product) => {
      assert.equal(product.images.length, 0);
      assert.ok(fetchMock.done());
    });
  });

  test('it can fetch a product by handle through Client#fetchProductByHandle', () => {
    fetchMock.postOnce(apiUrl, productByHandleFixture);

    const handle = productByHandleFixture.data.shop.productByHandle.handle;

    return client.fetchProductByHandle(handle).then((product) => {
      assert.equal(product.id, productByHandleFixture.data.shop.productByHandle.id);
      assert.equal(product.handle, handle);
      assert.ok(fetchMock.done());
    });
  });

  test('it can fetch a collection by handle through Client#fetchCollectionByHandle', () => {
    fetchMock.postOnce(apiUrl, collectionByHandleFixture);

    const handle = collectionByHandleFixture.data.shop.collectionByHandle.handle;

    return client.fetchCollectionByHandle(handle).then((collection) => {
      assert.equal(collection.id, collectionByHandleFixture.data.shop.collectionByHandle.id);
      assert.equal(collection.handle, handle);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves products with Client#fetchQueryProducts', () => {
    fetchMock.postOnce(apiUrl, shopWithProductsFixture);

    return client.fetchQueryProducts({}).then((products) => {
      assert.equal(products.length, 2);
      assert.equal(products[0].id, shopWithProductsFixture.data.shop.products.edges[0].node.id);
      assert.equal(products[1].id, shopWithProductsFixture.data.shop.products.edges[1].node.id);
      assert.ok(fetchMock.done());
    });
  });

  test('it can fetch collections with the query arg on Client#fetchQueryCollections', () => {
    fetchMock.postOnce(apiUrl, shopWithCollectionsFixture);

    return client.fetchQueryCollections({}).then((collections) => {
      assert.equal(collections.length, 2);
      assert.equal(collections[0].id, shopWithCollectionsFixture.data.shop.collections.edges[0].node.id);
      assert.equal(collections[1].id, shopWithCollectionsFixture.data.shop.collections.edges[1].node.id);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with `shop` on Client#fetchShopInfo', () => {
    fetchMock.postOnce(apiUrl, shopInfoFixture);

    return client.fetchShopInfo().then((shop) => {
      assert.equal(shop.name, shopInfoFixture.data.shop.name);
      assert.equal(shop.description, shopInfoFixture.data.shop.description);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with `shop` on Client#fetchShopPolicies', () => {
    fetchMock.postOnce(apiUrl, shopPoliciesFixture);

    return client.fetchShopPolicies().then((shop) => {
      assert.equal(shop.privacyPolicy.id, shopPoliciesFixture.data.shop.privacyPolicy.id);
      assert.equal(shop.termsOfService.id, shopPoliciesFixture.data.shop.termsOfService.id);
      assert.equal(shop.refundPolicy.id, shopPoliciesFixture.data.shop.refundPolicy.id);
      assert.ok(fetchMock.done());
    });
  });


  test('it can fetch all collections with products on Client#fetchAllCollectionsWithProducts', () => {
    fetchMock.postOnce(apiUrl, shopWithCollectionsWithProductsFixture);

    return client.fetchAllCollectionsWithProducts().then((collections) => {
      assert.ok(Array.isArray(collections), 'collections is an array');
      assert.equal(collections.length, 2, 'there are two collections');
      assert.equal(collections[0].id, shopWithCollectionsWithProductsFixture.data.shop.collections.edges[0].node.id);
      assert.equal(collections[1].id, shopWithCollectionsWithProductsFixture.data.shop.collections.edges[1].node.id);
      assert.ok(fetchMock.done());
    });
  });

  test('it can fetch a single collection with products on Client#fetchCollectionWithProducts', () => {
    fetchMock.postOnce(apiUrl, collectionWithProductsFixture);

    const id = collectionWithProductsFixture.data.node.id;

    return client.fetchCollectionWithProducts(id).then((collection) => {
      assert.equal(Array.isArray(collection), false, 'collection is not an array');
      assert.equal(collection.id, id);
      assert.equal(collection.products.length, 2);
      assert.ok(fetchMock.done());
    });
  });

  test('it paginates on images on products within collections on Client#fetchAllCollectionsWithProducts', () => {
    fetchMock.postOnce(apiUrl, shopWithCollectionsWithPaginationFixture)
      .postOnce(apiUrl, thirdPageImagesFixture)
      .postOnce(apiUrl, fourthPageImagesFixture)
      .postOnce(apiUrl, fifthPageImagesFixture);

    return client.fetchAllCollectionsWithProducts().then((collections) => {
      assert.equal(collections.length, 2);
      // Verify that all images are added
      assert.equal(collections[0].products[0].images.length, 2);
      assert.equal(collections[0].products[1].images.length, 2);
      assert.equal(collections[1].products[0].images.length, 2);
      assert.ok(fetchMock.done());
    });
  });
});
