import assert from 'assert';
import collectionQuery from '../src-graphql/collection-query';
import imageQuery from '../src-graphql/image-query';

suite('collection-query-test', () => {
  test('it returns with defaults', () => {
    const query = collectionQuery();
    const defaults = ['id', 'handle', 'updatedAt', 'title'];

    assert.deepEqual(query.scalars, defaults);
  });

  test('it returns with only the specified fields', () => {
    const query = collectionQuery(['id', 'title']);

    assert.deepEqual(query.scalars, ['id', 'title']);
  });

  test('it returns with only the specified image fields', () => {
    const query = collectionQuery([['image', imageQuery(['altText'])]]);

    assert.deepEqual(query.image.scalars, ['altText']);
  });
});
