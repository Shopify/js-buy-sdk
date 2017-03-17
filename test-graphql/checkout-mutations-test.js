import assert from 'assert';
import Client from '../src-graphql/client';
import Config from '../src-graphql/config';
import fetchMock from './isomorphic-fetch-mock'; // eslint-disable-line import/no-unresolved
import checkoutFixture from '../fixtures/checkout-fixture';

suite('checkout-mutations-test', () => {
  teardown(() => {
    fetchMock.restore();
  });

  const config = new Config({
    domain: 'checkout.myshopify.com',
    storefrontAccessToken: 'abc123'
  });

  const client = new Client(config);

  test('it can create a checkout', () => {
    const input = {
      lineItems: [
        {variantId: 'gid://shopify/ProductVariant/1', quantity: 5, customAttributes: [{key: 'hi', value: 'bye'}]}
      ],
      shippingAddress: {
        id: 'gid://shopify/MailingAddress/1',
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

    fetchMock.postOnce('https://checkout.myshopify.com/api/graphql', checkoutFixture);

    return client.Checkout.Mutations.create(input).then((checkout) => {
      assert.equal(checkout.id, checkoutFixture.data.checkoutCreate.checkout.id);
      assert.equal(checkout.lineItems[0].title, 'Intelligent Granite Table');
      assert.equal(checkout.lineItems[0].quantity, 5);
      assert.equal(checkout.shippingAddress.address1, '123 Cat Road');
      assert.ok(fetchMock.done());
    });
  });
});
