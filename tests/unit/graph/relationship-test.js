import { module, test } from 'qunit';
import relationship from 'shopify-buy/graph-helpers/relationship';

import QueryRoot from 'graph/query-root';

module('Unit | GraphHelpers | relationship');

test('it wraps the connection and edge, only passing the root relationship schema', function (assert) {
  assert.expect(1);

  relationship(QueryRoot, 'shop', shop => {
    return relationship(shop, 'products', { first: 10 }, product => {
      assert.equal(product.name, 'Product');
    });
  });
});

test('it includes edges, nodes, and pageInfo for paginated sets', function (assert) {
  assert.expect(7);

  const query = relationship(QueryRoot, 'shop', shop => {
    return relationship(shop, 'products', { first: 10 }, () => {
      return 'some-field';
    });
  });

  assert.ok(query, query);
  assert.ok(query.match(/pageInfo/));
  assert.ok(query.match(/hasNextPage/));
  assert.ok(query.match(/hasPreviousPage/));
  assert.ok(query.match(/cursor/));
  assert.ok(query.match(/node/));
  assert.ok(query.match(/edges/));
});

test('it passes the schema for non-paginated sets', function (assert) {
  assert.expect(1);

  relationship(QueryRoot, 'product', { id: 1 }, product => {
    return relationship(product, 'images', image => {
      assert.equal(image.name, 'Image');
    });
  });
});

test('it doesn\'t include nodes and edges in non-paginated queries', function (assert) {
  assert.expect(6);

  const query = relationship(QueryRoot, 'product', { id: 1 }, product => {
    return relationship(product, 'images', () => {
      return 'some-field';
    });
  });

  assert.ok(query.match(/[^pageInfo]/));
  assert.ok(query.match(/[^hasNextPage]/));
  assert.ok(query.match(/[^hasPreviousPage]/));
  assert.ok(query.match(/[^cursor]/));
  assert.ok(query.match(/[^node]/));
  assert.ok(query.match(/[^edges]/));
});
