import { module, test } from 'qunit';
import descriptorForField from 'shopify-buy/graph-helpers/descriptor-for-field';
import graphSchema from 'graph/schema';

module('Unit | GraphHelpers | descriptorForField');

test('it can generate descriptors for fields of the query root', function (assert) {
  assert.expect(15);

  const shopDescriptor = descriptorForField('shop', 'QueryRoot');
  const productDescriptor = descriptorForField('product', 'QueryRoot');
  const collectionDescriptor = descriptorForField('collection', 'QueryRoot');

  assert.equal(shopDescriptor.fieldName, 'shop', 'shop\'s field name');
  assert.equal(shopDescriptor.type, 'Shop', 'shop\'s type name');
  assert.equal(shopDescriptor.kind, 'OBJECT', 'shopDescriptor\'s type kind');
  assert.equal(shopDescriptor.isList, false, 'shop isList');
  assert.deepEqual(shopDescriptor.schema, graphSchema.Shop, 'shop\'s schema');

  assert.equal(productDescriptor.fieldName, 'product', 'product\'s field name');
  assert.equal(productDescriptor.type, 'Product', 'product\'s type name');
  assert.equal(productDescriptor.kind, 'OBJECT', 'productDescriptor\'s type kind');
  assert.equal(productDescriptor.isList, false, 'product isList');
  assert.deepEqual(productDescriptor.schema, graphSchema.Product, 'shop schema');

  assert.equal(collectionDescriptor.fieldName, 'collection', 'collection\'s field name');
  assert.equal(collectionDescriptor.type, 'Collection', 'collection\'s type name');
  assert.equal(productDescriptor.kind, 'OBJECT', 'productDescriptor\'s type kind');
  assert.equal(collectionDescriptor.isList, false, 'collection isList');
  assert.deepEqual(collectionDescriptor.schema, graphSchema.Collection, 'collection\'s schema');
});

test('it can describe scalars', function (assert) {
  assert.expect(5);

  const shopNameDescriptor = descriptorForField('name', 'Shop');

  assert.equal(shopNameDescriptor.fieldName, 'name', 'shopName\'s field name');
  assert.equal(shopNameDescriptor.type, 'String', 'shopName\'s type name');
  assert.equal(shopNameDescriptor.kind, 'SCALAR', 'shopName\'s type kind');
  assert.equal(shopNameDescriptor.isList, false, 'shopName isList');
  assert.deepEqual(shopNameDescriptor.schema, { name: 'String', kind: 'SCALAR' }, 'shopName schema');
});

test('it can describe lists', function (assert) {
  assert.expect(5);

  const productImagesDescriptor = descriptorForField('images', 'Product');

  assert.equal(productImagesDescriptor.fieldName, 'images', 'productImage\'s field name');
  assert.equal(productImagesDescriptor.type, 'Image', 'productImage\'s type name');
  assert.equal(productImagesDescriptor.kind, 'OBJECT', 'productImage\'s type kind ');
  assert.equal(productImagesDescriptor.isList, true, 'productImage isList');
  assert.deepEqual(productImagesDescriptor.schema, graphSchema.Image, 'productImage\'s schema');
});

test('it can describe connections', function (assert) {
  assert.expect(5);

  const shopProductsDescriptor = descriptorForField('products', 'Shop');

  assert.equal(shopProductsDescriptor.fieldName, 'products', 'shopProduct\'s field name');
  assert.equal(shopProductsDescriptor.type, 'ProductConnection', 'shopProduct\'s type name');
  assert.equal(shopProductsDescriptor.kind, 'OBJECT', 'shopProduct\'s type kind ');
  assert.equal(shopProductsDescriptor.isList, false, 'shopProduct isList');
  assert.deepEqual(shopProductsDescriptor.schema, graphSchema.ProductConnection, 'shopProduct\'s schema');
});
