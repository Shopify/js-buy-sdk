import { module, test } from 'qunit';
import descriptorForField from 'shopify-buy/graph-helpers/descriptor-for-field';
import graphSchema from 'graph/schema';

module('Unit | GraphHelpers | descriptorForField');

test('it returns the exact field type for fields representing singular resources', function (assert) {
  assert.expect(15);

  const shopDescriptor = descriptorForField('shop', 'QueryRoot');
  const productDescriptor = descriptorForField('product', 'QueryRoot');
  const collectionDescriptor = descriptorForField('collection', 'QueryRoot');

  const shopNameDescriptor = descriptorForField('name', 'Shop');

  assert.equal(shopDescriptor.fieldName, 'shop');
  assert.equal(shopDescriptor.typeName, 'Shop');
  assert.equal(shopDescriptor.isList, false);
  assert.deepEqual(shopDescriptor.type, graphSchema.Shop);
  assert.equal(productDescriptor.fieldName, 'product');
  assert.equal(productDescriptor.typeName, 'Product');
  assert.equal(productDescriptor.isList, false);
  assert.deepEqual(productDescriptor.type, graphSchema.Product);
  assert.equal(collectionDescriptor.fieldName, 'collection');
  assert.equal(collectionDescriptor.typeName, 'Collection');
  assert.equal(collectionDescriptor.isList, false);
  assert.deepEqual(collectionDescriptor.type, graphSchema.Collection);

  assert.equal(shopNameDescriptor.fieldName, 'name');
  assert.equal(shopNameDescriptor.typeName, 'Scalar');
  assert.equal(shopNameDescriptor.isList, false);
});

test('it returns the wrapped type for paginated lists', function (assert) {
  assert.expect(10);

  const shopProductsDescriptor = descriptorForField('products', 'Shop');
  const shopCollectionsDescriptor = descriptorForField('collections', 'Shop');

  assert.equal(shopProductsDescriptor.fieldName, 'products');
  assert.equal(shopProductsDescriptor.typeName, 'Product');
  assert.equal(shopProductsDescriptor.isList, true);
  assert.equal(shopProductsDescriptor.isPaginated, true);
  assert.deepEqual(shopProductsDescriptor.type, graphSchema.Product);
  assert.equal(shopCollectionsDescriptor.fieldName, 'collections');
  assert.equal(shopCollectionsDescriptor.typeName, 'Collection');
  assert.equal(shopCollectionsDescriptor.isList, true);
  assert.equal(shopCollectionsDescriptor.isPaginated, true);
  assert.deepEqual(shopCollectionsDescriptor.type, graphSchema.Collection);
});

test('it returns the exact type field for basic lists', function (assert) {
  assert.expect(4);

  const productImagesDescriptor = descriptorForField('images', 'Product');

  assert.equal(productImagesDescriptor.fieldName, 'images', 'productImage\'s type');
  assert.equal(productImagesDescriptor.typeName, 'Image', 'productImage\'s type');
  assert.equal(productImagesDescriptor.isList, true, 'productImage isList');
  assert.deepEqual(productImagesDescriptor.type, graphSchema.Image);
});
