import assert from 'assert';
import Config from '../src-graphql/config';
import Client from '../src-graphql/client';
import ProductHelpers from '../src-graphql/product-helpers';
import singleProductFixture from '../fixtures/product-fixture';
import fetchMock from './isomorphic-fetch-mock'; // eslint-disable-line import/no-unresolved

suite('product-helpers-test', () => {
  const productHelpers = new ProductHelpers();

  test('it returns the variant based on options given', () => {
    const config = new Config({
      domain: 'single-product.myshopify.com',
      storefrontAccessToken: 'abc123'
    });

    const client = new Client(config);

    fetchMock.postOnce('https://single-product.myshopify.com/api/graphql', singleProductFixture);

    return client.fetchProduct('7857989384').then((product) => {
      const variant = productHelpers.variantForOptions(product, {Fur: 'Fluffy', Size: 'Medium'});

      assert.equal(variant.id, 'gid://shopify/ProductVariant/25602235976');
    });
  });
});
