import assert from 'assert';
import normalizeId from '../src/normalize-id';

suite('normalize-id-tst', () => {
  test('it normalizes integer IDs', () => {
    const id = normalizeId('Product', 1234);

    assert.equal(id, 'gid://shopify/Product/1234');
  });

  test('it normalizes string IDs', () => {
    const id = normalizeId('Product', '1234');

    assert.equal(id, 'gid://shopify/Product/1234');
  });

  test('it normalizes IDs in GID format', () => {
    const id = normalizeId('Product', 'gid://shopify/Product/1234');

    assert.equal(id, 'gid://shopify/Product/1234');
  });
});
