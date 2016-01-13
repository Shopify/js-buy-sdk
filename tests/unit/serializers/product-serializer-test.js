import { module, test } from 'qunit';
import ProductSerializer from 'buy-button-sdk/serializers/product-serializer';

let serializer;

module('Unit | ProductSerializer', {
  setup() {
    serializer = new ProductSerializer();
  },
  teardown() {
    serializer = null;
  }
});

const singleProductFixture = {
  product_publications: [
    {
      id: 5123171009,
      product_id: 3680886721,
      channel_id: 40889985,
      created_at: '2016-01-05T11:32:26-05:00',
      updated_at: '2016-01-05T11:32:26-05:00',
      body_html: 'Why would you buy this?',
      handle: 'electricity-socket-with-jam',
      product_type: '',
      title: 'Electricity socket with jam',
      vendor: 'buckets-o-stuff',
      published_at: '2016-01-05T11:32:26-05:00',
      published: true,
      available: true,
      tags: '',
      images: [
      ],
      options: [
      ],
      variants: [
      ]
    }
  ]
};

const multipleProductsFixture = {
  product_publications: [
    singleProductFixture.product_publications[0],
    {
      id: 5123170945,
      product_id: 3677189889,
      channel_id: 40889985,
      created_at: '2016-01-05T11:32:26-05:00',
      updated_at: '2016-01-05T11:32:26-05:00',
      body_html: 'It\'s an aluminum pole. What\'re you expecting?',
      handle: 'aluminum-pole',
      product_type: '',
      title: 'Aluminum Pole',
      vendor: 'buckets-o-stuff',
      published_at: '2016-01-05T11:32:26-05:00',
      published: true,
      available: true,
      tags: '',
      images: [
      ],
      options: [
      ],
      variants: [
      ]
    }
  ]
};

test('it transforms a single item payload into a product object.', function (assert) {
  assert.expect(2);

  const model = serializer.serializeSingle(singleProductFixture);

  assert.notOk(Array.isArray(model), 'should not be an array');
  assert.deepEqual(model.attrs, singleProductFixture.product_publications[0]);
});

test('it transforms a collection payload into a list of product objects.', function (assert) {
  assert.expect(4);

  const models = serializer.serializeCollection(multipleProductsFixture);

  assert.ok(Array.isArray(models), 'should be an array');
  assert.equal(models.length, 2, 'we passed in two, it should serialize two');
  assert.deepEqual(models[0].attrs, multipleProductsFixture.product_publications[0]);
  assert.deepEqual(models[1].attrs, multipleProductsFixture.product_publications[1]);
});

test('it attaches a reference to the serializer on the model', function (assert) {
  assert.expect(1);

  const model = serializer.serializeSingle(singleProductFixture);

  assert.deepEqual(model.serializer, serializer);
});
