import { module, test } from 'qunit';
import rawDescriptorForField from 'shopify-buy/graph-helpers/raw-descriptor-for-field';

module('Unit | GraphHelpers | rawDescriptorForField');

test('it returns the exact field type', function (assert) {
  assert.expect(14);

  const shopDescriptor = rawDescriptorForField('shop', 'query-root');
  const productDescriptor = rawDescriptorForField('product', 'query-root');
  const collectionDescriptor = rawDescriptorForField('collection', 'query-root');

  const shopNameDescriptor = rawDescriptorForField('name', 'shop');
  const shopProductsDescriptor = rawDescriptorForField('products', 'shop');
  const shopCollectionsDescriptor = rawDescriptorForField('collections', 'shop');

  const productImagesDescriptor = rawDescriptorForField('images', 'product');

  assert.equal(shopDescriptor.name, 'Shop', 'shop\'s type');
  assert.equal(shopDescriptor.isList, false, 'shop isList');

  assert.equal(productDescriptor.name, 'Product', 'product\'s type');
  assert.equal(productDescriptor.isList, false, 'product isList');

  assert.equal(collectionDescriptor.name, 'Collection', 'collection\'s type');
  assert.equal(collectionDescriptor.isList, false, 'collection isList');


  assert.equal(shopNameDescriptor.name, 'Scalar', 'shopName\'s type');
  assert.equal(shopNameDescriptor.isList, false, 'shopName isList');

  assert.equal(shopProductsDescriptor.name, 'ProductConnection', 'shopProduct\'s type');
  assert.equal(shopProductsDescriptor.isList, false, 'shopProduct isList');

  assert.equal(shopCollectionsDescriptor.name, 'CollectionConnection', 'shopCollection\'s type');
  assert.equal(shopCollectionsDescriptor.isList, false, 'shopCollection isList');


  assert.equal(productImagesDescriptor.name, 'Image', 'productImage\'s type');
  assert.equal(productImagesDescriptor.isList, true, 'productImage isList');
});
