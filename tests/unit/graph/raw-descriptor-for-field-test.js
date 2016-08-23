import { module, test } from 'qunit';
import rawDescriptorForField from 'shopify-buy/graph-helpers/raw-descriptor-for-field';
import graphSchema from 'graph/schema';

module('Unit | GraphHelpers | rawDescriptorForField');

test('it returns the type name with the exact field type and name', function (assert) {
  assert.expect(20);

  const shopDescriptor = rawDescriptorForField('shop', 'query-root');
  const productDescriptor = rawDescriptorForField('product', 'query-root');
  const collectionDescriptor = rawDescriptorForField('collection', 'query-root');

  const shopNameDescriptor = rawDescriptorForField('name', 'shop');
  const shopProductsDescriptor = rawDescriptorForField('products', 'shop');
  const shopCollectionsDescriptor = rawDescriptorForField('collections', 'shop');

  const productImagesDescriptor = rawDescriptorForField('images', 'product');

  assert.equal(shopDescriptor.name, 'Shop', 'shop\'s type name');
  assert.equal(shopDescriptor.isList, false, 'shop isList');
  assert.deepEqual(shopDescriptor.type, graphSchema.shop, 'shop\'s type');

  assert.equal(productDescriptor.name, 'Product', 'product\'s type name');
  assert.equal(productDescriptor.isList, false, 'product isList');
  assert.deepEqual(productDescriptor.type, graphSchema.product, 'shop type');

  assert.equal(collectionDescriptor.name, 'Collection', 'collection\'s type');
  assert.equal(collectionDescriptor.isList, false, 'collection isList');
  assert.deepEqual(collectionDescriptor.type, graphSchema.collection, 'collection\'s type');


  assert.equal(shopNameDescriptor.name, 'Scalar', 'shopName\'s type name');
  assert.equal(shopNameDescriptor.isList, false, 'shopName isList');

  assert.equal(shopProductsDescriptor.name, 'ProductConnection', 'shopProduct\'s type name');
  assert.equal(shopProductsDescriptor.isList, false, 'shopProduct isList');
  assert.deepEqual(shopProductsDescriptor.type, graphSchema['product-connection'], 'shopProduct\'s type');

  assert.equal(shopCollectionsDescriptor.name, 'CollectionConnection', 'shopCollection\'s type name');
  assert.equal(shopCollectionsDescriptor.isList, false, 'shopCollection isList');
  assert.deepEqual(shopCollectionsDescriptor.type, graphSchema['collection-connection'], 'collectionConnection\'s type');


  assert.equal(productImagesDescriptor.name, 'Image', 'productImage\'s type name');
  assert.equal(productImagesDescriptor.isList, true, 'productImage isList');
  assert.deepEqual(productImagesDescriptor.type, graphSchema.image, 'productImage\'s type');
});
