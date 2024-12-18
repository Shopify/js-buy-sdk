import assert from 'assert';
import Client from '../src/client';

const PRODUCT_IDS = [
  'gid://shopify/Product/9895276099',
  'gid://shopify/Product/9895279043',
  'gid://shopify/Product/9895281475',
  'gid://shopify/Product/9895284291',
  'gid://shopify/Product/9895287619',
  'gid://shopify/Product/9895288515',
  'gid://shopify/Product/9895289667',
  'gid://shopify/Product/9895290755',
  'gid://shopify/Product/9895292227',
  'gid://shopify/Product/9895293571',
  'gid://shopify/Product/9895295235',
  'gid://shopify/Product/9895296451',
  'gid://shopify/Product/9895297923',
  'gid://shopify/Product/9895299331',
  'gid://shopify/Product/9895300995',
  'gid://shopify/Product/9895302467',
  'gid://shopify/Product/9895303555',
  'gid://shopify/Product/9895304515',
  'gid://shopify/Product/9895305219',
  'gid://shopify/Product/9895306115'
];

const COLLECTIONS = [
  {id: 'gid://shopify/Collection/243638019', handle: 'frontpage'},
  {
    id: 'gid://shopify/Collection/257697667',
    handle: 'antiperistaltic-gold-socks'
  },
  {
    id: 'gid://shopify/Collection/257697731',
    handle: 'blistered-aluminum-boat'
  },
  {id: 'gid://shopify/Collection/389242179', handle: 'latest-stuff'},
  {id: 'gid://shopify/Collection/389242499', handle: 'casual-things'},
  {
    id: 'gid://shopify/Collection/389242819',
    handle: 'summer-collection'
  },
  {id: 'gid://shopify/Collection/425800451', handle: 'services'},
  {id: 'gid://shopify/Collection/67984719928', handle: 'gifts'},
  {id: 'gid://shopify/Collection/627010207800', handle: 'jsbuysdk'}
];

suite('client-integration-test', () => {
  const domain = 'graphql.myshopify.com';
  const config = {
    storefrontAccessToken: '595005d0c565f6969eece280de85edb5',
    domain
  };
  let client;
  let apiUrl;

  setup(() => {
    client = Client.buildClient(config);
    apiUrl = `https://${domain}/api/${client.config.apiVersion}/graphql`;
  });

  teardown(() => {
    client = null;
  });

  test('it resolves with an array of products on Client.product#fetchAllProducts', () => {

    return client.product.fetchAll().then((products) => {
      assert.ok(Array.isArray(products), 'products is an array');
      assert.equal(products[0].id, PRODUCT_IDS[0]);
    });
  });

  test('it resolves with a single product on Client.product#fetch', () => {

    return client.product.fetch(PRODUCT_IDS[0]).then((product) => {
      assert.ok(!Array.isArray(product), 'product is not an array');
      assert.equal(product.id, PRODUCT_IDS[0]);
    });
  });

  test('it resolves recommended products on Client.product#fetchRecommendations', () => {

    return client.product.fetchRecommendations(PRODUCT_IDS[0]).then((products) => {
      assert.ok(Array.isArray(products), 'recommended products are an array');
    });
  });

  test('it resolves with an array of products on Client.product#fetchMultiple', () => {
    return client.product.fetchMultiple([PRODUCT_IDS[0], PRODUCT_IDS[1]]).then((products) => {
      assert.ok(Array.isArray(products), 'products are an array');
      assert.equal(products[0].id, PRODUCT_IDS[0]);
      assert.equal(products[1].id, PRODUCT_IDS[1]);
    });
  });

  test('it fetches all images on products on Client.product#fetchAll', () => {
    return client.product.fetchAll().then((products) => {
      const images = products[0].images;

      assert.ok(Array.isArray(images), 'images is an array');
      assert.equal(images.length, 4, 'all three pages of images are returned');
    });
  });

  test('it fetches all variants on Client.product#fetch', () => {

    return client.product.fetch(PRODUCT_IDS[0]).then((product) => {
      const variants = product.variants;

      assert.ok(Array.isArray(variants), 'variants is an array');
      assert.equal(variants.length, 10, 'all three pages of variants are returned');
    });
  });

  test('it can fetch a product by handle through Client.product#fetchByHandle', () => {
    const handle = 'snare-boot';

    return client.product.fetchByHandle(handle).then((product) => {
      assert.equal(product.id, PRODUCT_IDS[0]);
      assert.equal(product.handle, handle);
    });
  });

  test('it resolves products with Client.product#fetchQuery', () => {

    return client.product.fetchQuery({}).then((products) => {
      assert.ok(products.length > 10, 'products are returned');
    });
  });

  test('it resolves with an array of collections on Client.collection#fetchAll', () => {
    return client.collection.fetchAll().then((collections) => {
      assert.ok(Array.isArray(collections), 'collections is an array');
      assert.ok(collections.length > 8, 'there are more than 9 collections');
    });
  });

  test('it resolves with a single collection on Client.collection#fetch', () => {

    return client.collection.fetch(COLLECTIONS[0].id).then((collection) => {
      assert.ok(Array.isArray(collection) === false, 'collection is not an array');
      assert.equal(collection.id, collection.id);
    });
  });

  test('it can fetch a collection by handle through Client.collection#fetchByHandle', () => {

    return client.collection.fetchByHandle(COLLECTIONS[0].handle).then((collection) => {
      assert.equal(collection.id, COLLECTIONS[0].id);
      assert.equal(collection.handle, COLLECTIONS[0].handle);
    });
  });

  test('it can fetch collections with the query arg on Client.collection#fetchQuery', () => {

    return client.collection.fetchQuery({}).then((collections) => {
      assert.ok(collections.length > 8, 'collections are returned');
    });
  });

  test('it can fetch all collections with products on Client.collection#fetchAllWithProducts', () => {

    return client.collection.fetchAllWithProducts().then((collections) => {
      const collectionProducts = collections[3].products;
      assert.ok(collectionProducts.length > 0, 'collection returned with products');
    });
  });

  test('it can fetch a single collection with products on Client.collection#fetchWithProducts', () => {

    return client.collection.fetchWithProducts(COLLECTIONS[3].id).then((collection) => {
      assert.equal(Array.isArray(collection), false, 'collection is not an array');
      assert.equal(collection.id, COLLECTIONS[3].id);
      assert.ok(collection.products.length > 2);
    });
  });

  test('it paginates on images on products within collections on Client.collection#fetchAllWithProducts', () => {

    return client.collection.fetchAllWithProducts().then((collections) => {
      assert.ok(collections[3].products[0].images.length > 0);
      assert.ok(collections[3].products[1].images.length > 0);
      assert.ok(collections[4].products[0].images.length > 0);
    });
  });

  test('it resolves with `shop` on Client.shop#fetchInfo', () => {
    return client.shop.fetchInfo().then((shop) => {
      assert.equal(shop.name, 'graphql');
      assert.equal(shop.description, 'An example shop with GraphQL.');
    });
  });

  test('it resolves with `shop` on Client.shop#fetchPolicies', () => {

    return client.shop.fetchPolicies().then((shop) => {
      assert.equal(shop.privacyPolicy.id, 'gid://shopify/ShopPolicy/30401283');
      assert.equal(shop.termsOfService.id, 'gid://shopify/ShopPolicy/30401347');
      assert.equal(shop.refundPolicy.id, 'gid://shopify/ShopPolicy/30401219');
    });
  });
});
