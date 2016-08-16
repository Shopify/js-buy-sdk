import { module, test } from 'qunit';
import rawTypeForField from 'shopify-buy/graph-helpers/raw-type-for-field';

module('Unit | GraphHelpers | rawTypeForField');

test('it returns the exact field type', function (assert) {
  assert.expect(14);

  const shopType = rawTypeForField('shop', 'query-root');
  const productType = rawTypeForField('product', 'query-root');
  const collectionType = rawTypeForField('collection', 'query-root');

  const shopNameType = rawTypeForField('name', 'shop');
  const shopProductsType = rawTypeForField('products', 'shop');
  const shopCollectionsType = rawTypeForField('collections', 'shop');

  const productImagesType = rawTypeForField('images', 'product');

  assert.equal(shopType.name, 'Shop', 'shop\'s type');
  assert.equal(shopType.isList, false, 'shop isList');
  assert.equal(productType.name, 'Product', 'product\'s type');
  assert.equal(productType.isList, false, 'product isList');
  assert.equal(collectionType.name, 'Collection', 'collection\'s type');
  assert.equal(collectionType.isList, false, 'collection isList');

  assert.equal(shopNameType.name, 'Literal', 'shopName\'s type');
  assert.equal(shopNameType.isList, false, 'shopName isList');
  assert.equal(shopProductsType.name, 'ProductConnection', 'shopProduct\'s type');
  assert.equal(shopProductsType.isList, false, 'shopProduct isList');
  assert.equal(shopCollectionsType.name, 'CollectionConnection', 'shopCollection\'s type');
  assert.equal(shopCollectionsType.isList, false, 'shopCollection isList');

  assert.equal(productImagesType.name, 'Image', 'productImage\'s type');
  assert.equal(productImagesType.isList, true, 'productImage isList');
});
