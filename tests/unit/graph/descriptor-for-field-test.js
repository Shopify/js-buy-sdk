import { module, test } from 'qunit';
import descriptorForField from 'shopify-buy/graph-helpers/descriptor-for-field';
import graphSchema from 'graph/schema';

module('Unit | GraphHelpers | descriptorForField');

test('it returns the exact field type for fields representing singular resources', function (assert) {
  assert.expect(16);

  const shopDescriptor = descriptorForField('shop', 'QueryRoot');
  const productDescriptor = descriptorForField('product', 'QueryRoot');
  const collectionDescriptor = descriptorForField('collection', 'QueryRoot');

  const shopNameDescriptor = descriptorForField('name', 'Shop');

  assert.equal(shopDescriptor.fieldName, 'shop');
  assert.equal(shopDescriptor.type, 'Shop');
  assert.equal(shopDescriptor.isList, false);
  assert.deepEqual(shopDescriptor.schema, graphSchema.Shop);
  assert.equal(productDescriptor.fieldName, 'product');
  assert.equal(productDescriptor.type, 'Product');
  assert.equal(productDescriptor.isList, false);
  assert.deepEqual(productDescriptor.schema, graphSchema.Product);
  assert.equal(collectionDescriptor.fieldName, 'collection');
  assert.equal(collectionDescriptor.type, 'Collection');
  assert.equal(collectionDescriptor.isList, false);
  assert.deepEqual(collectionDescriptor.schema, graphSchema.Collection);

  assert.equal(shopNameDescriptor.fieldName, 'name');
  assert.equal(shopNameDescriptor.type, 'String');
  assert.equal(shopNameDescriptor.kind, 'SCALAR');
  assert.equal(shopNameDescriptor.isList, false);
});

test('it returns the wrapped type for paginated lists', function (assert) {
  assert.expect(10);

  const shopProductsDescriptor = descriptorForField('products', 'Shop');
  const shopCollectionsDescriptor = descriptorForField('collections', 'Shop');

  assert.equal(shopProductsDescriptor.fieldName, 'products');
  assert.equal(shopProductsDescriptor.type, 'Product');
  assert.equal(shopProductsDescriptor.isList, true);
  assert.equal(shopProductsDescriptor.isConnection, true);
  assert.deepEqual(shopProductsDescriptor.schema, graphSchema.Product);
  assert.equal(shopCollectionsDescriptor.fieldName, 'collections');
  assert.equal(shopCollectionsDescriptor.type, 'Collection');
  assert.equal(shopCollectionsDescriptor.isList, true);
  assert.equal(shopCollectionsDescriptor.isConnection, true);
  assert.deepEqual(shopCollectionsDescriptor.schema, graphSchema.Collection);
});

test('it returns the exact type field for basic lists', function (assert) {
  assert.expect(4);

  const productImagesDescriptor = descriptorForField('images', 'Product');

  assert.equal(productImagesDescriptor.fieldName, 'images', 'productImage\'s type');
  assert.equal(productImagesDescriptor.type, 'Image', 'productImage\'s type');
  assert.equal(productImagesDescriptor.isList, true, 'productImage isList');
  assert.deepEqual(productImagesDescriptor.schema, graphSchema.Image);
});
