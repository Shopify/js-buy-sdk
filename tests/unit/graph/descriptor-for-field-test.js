import { module, test } from 'qunit';
import descriptorForField from 'shopify-buy/graph-helpers/descriptor-for-field';

module('Unit | GraphHelpers | descriptorForField');

test('it returns the exact field type for fields representing singular', function (assert) {
  assert.expect(8);

  const shopDescriptor = descriptorForField('shop', 'query-root');
  const productDescriptor = descriptorForField('product', 'query-root');
  const collectionDescriptor = descriptorForField('collection', 'query-root');

  const shopNameDescriptor = descriptorForField('name', 'shop');

  assert.equal(shopDescriptor.name, 'Shop');
  assert.equal(shopDescriptor.isList, false);
  assert.equal(productDescriptor.name, 'Product');
  assert.equal(productDescriptor.isList, false);
  assert.equal(collectionDescriptor.name, 'Collection');
  assert.equal(collectionDescriptor.isList, false);

  assert.equal(shopNameDescriptor.name, 'Scalar');
  assert.equal(shopNameDescriptor.isList, false);
});

test('it returns the wrapped type for paginated lists', function (assert) {
  const shopProductsDescriptor = descriptorForField('products', 'shop');
  const shopCollectionsDescriptor = descriptorForField('collections', 'shop');

  assert.equal(shopProductsDescriptor.name, 'Product');
  assert.equal(shopProductsDescriptor.isList, true);
  assert.equal(shopCollectionsDescriptor.name, 'Collection');
  assert.equal(shopCollectionsDescriptor.isList, true);
});

test('it returns the exact type field for basic lists', function (assert) {
  const productImagesDescriptor = descriptorForField('images', 'product');

  assert.equal(productImagesDescriptor.name, 'Image', 'productImage\'s type');
  assert.equal(productImagesDescriptor.isList, true, 'productImage isList');
});
