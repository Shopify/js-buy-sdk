import { module, test } from 'qunit';
import ListingsSerializer from 'shopify-buy/serializers/listings-serializer';
import BaseModel from 'shopify-buy/models/base-model';
import ProductModel from 'shopify-buy/models/product-model';
import { singleProductFixture, multipleProductsFixture } from '../../fixtures/product-fixture';
import { singleCollectionFixture, multipleCollectionsFixture } from '../../fixtures/collection-fixture';

let serializer;

module('Unit | ListingsSerializer', {
  setup() {
    serializer = new ListingsSerializer();
  },
  teardown() {
    serializer = null;
  }
});


test('it discovers the root key from the type', function (assert) {
  assert.expect(2);

  assert.equal(serializer.rootKeyForType('products'), 'product_listing');
  assert.equal(serializer.rootKeyForType('collections'), 'collection_listing');
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
  assert.deepEqual(model.attrs, singleProductFixture.product_listing);
});

test('it transforms an array payload into a list of product objects.', function (assert) {
  assert.expect(4);

  const models = serializer.deserializeMultiple('products', multipleProductsFixture);

  assert.ok(Array.isArray(models), 'should be an array');
  assert.equal(models.length, 2, 'we passed in two, it should serialize two');
  assert.deepEqual(models[0].attrs, multipleProductsFixture.product_listings[0]);
  assert.deepEqual(models[1].attrs, multipleProductsFixture.product_listings[1]);
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
  assert.deepEqual(model.attrs, singleCollectionFixture.collection_listing);
});

test('it transforms an array payload into a list of collection objects.', function (assert) {
  assert.expect(4);

  const models = serializer.deserializeMultiple('collections', multipleCollectionsFixture);

  assert.ok(Array.isArray(models), 'should be an array');
  assert.equal(models.length, 2, 'we passed in two, it should serialize two');
  assert.deepEqual(models[0].attrs, multipleCollectionsFixture.collection_listings[0]);
  assert.deepEqual(models[1].attrs, multipleCollectionsFixture.collection_listings[1]);
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
