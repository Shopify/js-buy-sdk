import { module, test } from 'qunit';
import descriptorForField from 'shopify-buy/graph-helpers/descriptor-for-field';
import graphSchema from 'graph/schema';

module('Unit | GraphHelpers | descriptorForField');

test('it returns the exact field type for fields representing singular', function (assert) {
  assert.expect(11);

  const shopDescriptor = descriptorForField('shop', 'query-root');
  const productDescriptor = descriptorForField('product', 'query-root');
  const collectionDescriptor = descriptorForField('collection', 'query-root');

  const shopNameDescriptor = descriptorForField('name', 'shop');

  assert.equal(shopDescriptor.name, 'Shop');
  assert.equal(shopDescriptor.isList, false);
  assert.deepEqual(shopDescriptor.type, graphSchema.shop);
  assert.equal(productDescriptor.name, 'Product');
  assert.equal(productDescriptor.isList, false);
  assert.deepEqual(productDescriptor.type, graphSchema.product);
  assert.equal(collectionDescriptor.name, 'Collection');
  assert.equal(collectionDescriptor.isList, false);
  assert.deepEqual(collectionDescriptor.type, graphSchema.collection);

  assert.equal(shopNameDescriptor.name, 'Scalar');
  assert.equal(shopNameDescriptor.isList, false);
});

test('it returns the wrapped type for paginated lists', function (assert) {
  assert.expect(6);

  const shopProductsDescriptor = descriptorForField('products', 'shop');
  const shopCollectionsDescriptor = descriptorForField('collections', 'shop');

  assert.equal(shopProductsDescriptor.name, 'Product');
  assert.equal(shopProductsDescriptor.isList, true);
  assert.deepEqual(shopProductsDescriptor.type, graphSchema.product);
  assert.equal(shopCollectionsDescriptor.name, 'Collection');
  assert.equal(shopCollectionsDescriptor.isList, true);
  assert.deepEqual(shopCollectionsDescriptor.type, graphSchema.collection);
});

test('it returns the exact type field for basic lists', function (assert) {
  assert.expect(3);

  const productImagesDescriptor = descriptorForField('images', 'product');

  assert.equal(productImagesDescriptor.name, 'Image', 'productImage\'s type');
  assert.equal(productImagesDescriptor.isList, true, 'productImage isList');
  assert.deepEqual(productImagesDescriptor.type, graphSchema.image);
});
