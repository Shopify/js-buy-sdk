import { module, test } from 'qunit';
import typeForField from 'shopify-buy/graph-helpers/type-for-field';

module('Unit | GraphHelpers | typeForField');

test('it returns the exact field type for fields representing singular', function (assert) {
  assert.expect(8);

  const shopType = typeForField('shop', 'query-root');
  const productType = typeForField('product', 'query-root');
  const collectionType = typeForField('collection', 'query-root');

  const shopNameType = typeForField('name', 'shop');

  assert.equal(shopType.name, 'Shop');
  assert.equal(shopType.isList, false);
  assert.equal(productType.name, 'Product');
  assert.equal(productType.isList, false);
  assert.equal(collectionType.name, 'Collection');
  assert.equal(collectionType.isList, false);

  assert.equal(shopNameType.name, 'Scalar');
  assert.equal(shopNameType.isList, false);
});

test('it returns the wrapped type for paginated lists', function (assert) {
  const shopProductsType = typeForField('products', 'shop');
  const shopCollectionsType = typeForField('collections', 'shop');

  assert.equal(shopProductsType.name, 'Product');
  assert.equal(shopProductsType.isList, true);
  assert.equal(shopCollectionsType.name, 'Collection');
  assert.equal(shopCollectionsType.isList, true);
});

test('it returns the exact type field for basic lists', function (assert) {
  const productImagesType = typeForField('images', 'product');

  assert.equal(productImagesType.name, 'Image', 'productImage\'s type');
  assert.equal(productImagesType.isList, true, 'productImage isList');
});
