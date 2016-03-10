import { module, test } from 'qunit';
import PublicationSerializer from 'js-buy-sdk/serializers/publication-serializer';
import BaseModel from 'js-buy-sdk/models/base-model';
import ProductModel from 'js-buy-sdk/models/product-model';

let serializer;

module('Unit | PublicationSerializer', {
  setup() {
    serializer = new PublicationSerializer();
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

const singleCollectionFixture = {
  collection_publications: [
    {
      id: 220591297,
      collection_id: 159064961,
      channel_id: 40889985,
      created_at: '2016-01-05T11:32:26-05:00',
      updated_at: '2016-01-05T11:32:26-05:00',
      body_html: '',
      handle: 'blergh',
      image: null,
      title: 'Blergh.',
      published_at: '2016-01-05T11:32:26-05:00',
      published: true
    }
  ]
};

const multipleCollectionsFixture = {
  collection_publications: [
    singleCollectionFixture.collection_publications[0],
    {
      id: 220591233,
      collection_id: 157327425,
      channel_id: 40889985,
      created_at: '2016-01-05T11:32:26-05:00',
      updated_at: '2016-01-05T11:32:26-05:00',
      body_html: null,
      handle: 'frontpage',
      image: null,
      title: 'Home page',
      published_at: '2016-01-05T11:32:26-05:00',
      published: true
    }
  ]
};

test('it discovers the root key from the type', function (assert) {
  assert.expect(2);

  assert.equal(serializer.rootKeyForType('products'), 'product_publications');
  assert.equal(serializer.rootKeyForType('collections'), 'collection_publications');
});

test('it returns the correct model for a type', function (assert) {
  assert.expect(2);

  assert.equal(serializer.modelForType('products'), ProductModel);
  assert.equal(serializer.modelForType('collections'), BaseModel);
});

test('it transforms a single item payload into a product object.', function (assert) {
  assert.expect(2);

  const model = serializer.deserializeSingle('products', singleProductFixture);

  assert.notOk(Array.isArray(model), 'should not be an array');
  assert.deepEqual(model.attrs, singleProductFixture.product_publications[0]);
});

test('it transforms a collection payload into a list of product objects.', function (assert) {
  assert.expect(4);

  const models = serializer.deserializeMultiple('products', multipleProductsFixture);

  assert.ok(Array.isArray(models), 'should be an array');
  assert.equal(models.length, 2, 'we passed in two, it should serialize two');
  assert.deepEqual(models[0].attrs, multipleProductsFixture.product_publications[0]);
  assert.deepEqual(models[1].attrs, multipleProductsFixture.product_publications[1]);
});

test('it attaches a reference of the passed serializer to the model on #deserializeSingle', function (assert) {
  assert.expect(1);

  const model = serializer.deserializeSingle('products', singleProductFixture, { serializer });

  assert.deepEqual(model.serializer, serializer);
});

test('it attaches a reference of the passed serializer to the model on #deserializeMultiple', function (assert) {
  assert.expect(2);

  const models = serializer.deserializeMultiple('products', multipleProductsFixture, { serializer });

  assert.deepEqual(models[0].serializer, serializer);
  assert.deepEqual(models[1].serializer, serializer);
});

test('it attaches a reference of the passed shopClient to the model on #deserializeSingle', function (assert) {
  assert.expect(1);

  const shopClient = 'some-shop-client';

  const model = serializer.deserializeSingle('products', singleProductFixture, { shopClient });

  assert.equal(model.shopClient, shopClient);
});

test('it attaches a reference of the passed shopClient to every model on #deserializeMultiple', function (assert) {
  assert.expect(2);

  const shopClient = 'some-shop-client';

  const models = serializer.deserializeMultiple('products', multipleProductsFixture, { shopClient });

  assert.deepEqual(models[0].shopClient, shopClient);
  assert.deepEqual(models[1].shopClient, shopClient);
});

test('it transforms a single item payload into a collection object.', function (assert) {
  assert.expect(2);

  const model = serializer.deserializeSingle('collections', singleCollectionFixture);

  assert.notOk(Array.isArray(model), 'should not be an array');
  assert.deepEqual(model.attrs, singleCollectionFixture.collection_publications[0]);
});

test('it transforms a collection payload into a list of collection objects.', function (assert) {
  assert.expect(4);

  const models = serializer.deserializeMultiple('collections', multipleCollectionsFixture);

  assert.ok(Array.isArray(models), 'should be an array');
  assert.equal(models.length, 2, 'we passed in two, it should serialize two');
  assert.deepEqual(models[0].attrs, multipleCollectionsFixture.collection_publications[0]);
  assert.deepEqual(models[1].attrs, multipleCollectionsFixture.collection_publications[1]);
});

test('it attaches a reference of the passed serializer to the model on #deserializeSingle', function (assert) {
  assert.expect(1);

  const model = serializer.deserializeSingle('collections', singleCollectionFixture, { serializer });

  assert.deepEqual(model.serializer, serializer);
});

test('it attaches a reference of the passed serializer to the model on #deserializeMultiple', function (assert) {
  assert.expect(2);

  const models = serializer.deserializeMultiple('collections', multipleCollectionsFixture, { serializer });

  assert.deepEqual(models[0].serializer, serializer);
  assert.deepEqual(models[1].serializer, serializer);
});

test('it attaches a reference of the passed shopClient to the model on #deserializeSingle', function (assert) {
  assert.expect(1);

  const shopClient = 'some-shop-client';

  const model = serializer.deserializeSingle('collections', singleCollectionFixture, { shopClient });

  assert.equal(model.shopClient, shopClient);
});

test('it attaches a reference of the passed shopClient to every model on #deserializeMultiple', function (assert) {
  assert.expect(2);

  const shopClient = 'some-shop-client';

  const models = serializer.deserializeMultiple('collections', multipleCollectionsFixture, { shopClient });

  assert.deepEqual(models[0].shopClient, shopClient);
  assert.deepEqual(models[1].shopClient, shopClient);
});
