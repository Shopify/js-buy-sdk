import { module, test } from 'qunit';
import rawDescriptorForField from 'shopify-buy/graph-helpers/raw-descriptor-for-field';
import graphSchema from 'graph/schema';

module('Unit | GraphHelpers | rawDescriptorForField');

test('it returns the type name with the exact field type and name', function (assert) {
  assert.expect(27);

  const shopDescriptor = rawDescriptorForField('shop', 'QueryRoot');
  const productDescriptor = rawDescriptorForField('product', 'QueryRoot');
  const collectionDescriptor = rawDescriptorForField('collection', 'QueryRoot');

  const shopNameDescriptor = rawDescriptorForField('name', 'Shop');
  const shopProductsDescriptor = rawDescriptorForField('products', 'Shop');
  const shopCollectionsDescriptor = rawDescriptorForField('collections', 'Shop');

  const productImagesDescriptor = rawDescriptorForField('images', 'Product');

  assert.equal(shopDescriptor.fieldName, 'shop', 'shop\'s field name');
  assert.equal(shopDescriptor.typeName, 'Shop', 'shop\'s type name');
  assert.equal(shopDescriptor.isList, false, 'shop isList');
  assert.deepEqual(shopDescriptor.type, graphSchema.Shop, 'shop\'s type');

  assert.equal(productDescriptor.fieldName, 'product', 'product\'s field name');
  assert.equal(productDescriptor.typeName, 'Product', 'product\'s type name');
  assert.equal(productDescriptor.isList, false, 'product isList');
  assert.deepEqual(productDescriptor.type, graphSchema.Product, 'shop type');

  assert.equal(collectionDescriptor.fieldName, 'collection', 'collection\'s field name');
  assert.equal(collectionDescriptor.typeName, 'Collection', 'collection\'s type name');
  assert.equal(collectionDescriptor.isList, false, 'collection isList');
  assert.deepEqual(collectionDescriptor.type, graphSchema.Collection, 'collection\'s type');


  assert.equal(shopNameDescriptor.fieldName, 'name', 'shopName\'s field name');
  assert.equal(shopNameDescriptor.typeName, 'Scalar', 'shopName\'s type name');
  assert.equal(shopNameDescriptor.isList, false, 'shopName isList');

  assert.equal(shopProductsDescriptor.fieldName, 'products', 'shopProduct\'s field name');
  assert.equal(shopProductsDescriptor.typeName, 'ProductConnection', 'shopProduct\'s type name');
  assert.equal(shopProductsDescriptor.isList, false, 'shopProduct isList');
  assert.deepEqual(shopProductsDescriptor.type, graphSchema.ProductConnection, 'shopProduct\'s type');

  assert.equal(shopCollectionsDescriptor.fieldName, 'collections', 'shopCollection\'s type name');
  assert.equal(shopCollectionsDescriptor.typeName, 'CollectionConnection', 'shopCollection\'s type name');
  assert.equal(shopCollectionsDescriptor.isList, false, 'shopCollection isList');
  assert.deepEqual(shopCollectionsDescriptor.type, graphSchema.CollectionConnection, 'collectionConnection\'s type');


  assert.equal(productImagesDescriptor.fieldName, 'images', 'productImage\'s field name');
  assert.equal(productImagesDescriptor.typeName, 'Image', 'productImage\'s type name');
  assert.equal(productImagesDescriptor.isList, true, 'productImage isList');
  assert.deepEqual(productImagesDescriptor.type, graphSchema.Image, 'productImage\'s type');
});
