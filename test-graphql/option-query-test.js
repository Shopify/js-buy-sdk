import assert from 'assert';
import optionQuery from '../src-graphql/option-query';

suite('option-query-test', () => {
  test('it returns with defaults', () => {
    const query = optionQuery();
    const defaults = ['id', 'name', 'values'];

    assert.deepEqual(query.scalars, defaults);
  });

  test('it returns using specified fields', () => {
    const query = optionQuery('values');

    assert.deepEqual(query.scalars, ['values']);
  });
});
