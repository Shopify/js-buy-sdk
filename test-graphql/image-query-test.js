import assert from 'assert';
import imageQuery from '../src-graphql/image-query';

suite('image-query-test', () => {
  test('it returns with defaults', () => {
    const query = imageQuery();
    const defaults = ['id', 'src', 'altText'];

    assert.deepEqual(query.scalars, defaults);
  });

  test('it returns using specified fields', () => {
    const query = imageQuery('id');

    assert.deepEqual(query.scalars, ['id']);
  });
});
