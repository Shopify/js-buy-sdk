import assert from 'assert';
import variantQuery from '../src-graphql/variant-query';

suite('variant-query-test', () => {
  test('it returns with defaults', () => {
    const query = variantQuery();
    const defaults = ['id', 'title', 'price', 'weight'];

    assert.deepEqual(query.scalars, defaults);
    assert.deepEqual(query.selectedOptions, {scalars: ['name', 'value']});
  });

  test('it returns with specified fields', () => {
    const query = variantQuery('price', 'weight');

    assert.deepEqual(query.scalars, ['price', 'weight']);
  });
});
