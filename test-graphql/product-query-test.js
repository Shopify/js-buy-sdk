import assert from 'assert';
import productQuery from '../src-graphql/product-query';

suite('product-query-test', () => {
  test('it returns with defaults', () => {
    const query = productQuery();
    const defaults = ['id', 'createdAt', 'updatedAt', 'bodyHtml', 'handle', 'productType', 'title', 'vendor',
      'tags', 'publishedAt'];

    assert.deepEqual(query.scalars, defaults);
  });

  test('it returns with only the specified fields', () => {
    const query = productQuery('id', 'createdAt');

    assert.deepEqual(query.scalars, ['id', 'createdAt']);
    assert.equal(typeof query.options, 'undefined');
  });

  test('it returns with only the specified object fields', () => {
    const query = productQuery({options: {fields: ['name', 'id']}}, {images: {fields: ['id']}},
      {variants: {fields: ['price', 'weight']}});

    assert.equal(query.scalars.length, 0);
    assert.deepEqual(query.options.scalars, ['name', 'id']);
    assert.deepEqual(query.images.scalars, ['id']);
    assert.deepEqual(query.variants.scalars, ['price', 'weight']);
  });
});
