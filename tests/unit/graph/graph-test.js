import { module, test } from 'qunit';
import Graph from 'shopify-buy/graph-helpers/graph';

module('Unit | GraphHelpers | class Graph');

const querySplitter = /[\s,]+/;

function splitQuery(query) {
  return query.split(querySplitter);
}

test('it builds queries off the root', function (assert) {
  const graph = new Graph();

  assert.deepEqual(splitQuery(graph.toQuery()), splitQuery('query { }'));
});

test('it builds queries off the passed type', function (assert) {
  const graph = new Graph('Shop');

  assert.deepEqual(splitQuery(graph.toQuery()), splitQuery('fragment on Shop { }'));
});

test('it can add basic fields', function (assert) {
  const graph = new Graph('Shop');

  graph.addField('name');

  assert.deepEqual(splitQuery(graph.toQuery()), splitQuery('fragment on Shop { name }'));
});

test('it yields an instance of Graph representing the type passed to addField', function (assert) {
  const graph = new Graph();

  graph.addField('shop', {}, function (shop) {
    assert.ok(Graph.prototype.isPrototypeOf(shop));
  });
});

test('it composes nested graphs', function (assert) {
  const graph = new Graph();

  graph.addField('shop', {}, function (shop) {
    shop.addField('name');
  });

  assert.deepEqual(splitQuery(graph.toQuery()), splitQuery('query { shop { name } }'));
});

test('it can attach args to nested nodes', function (assert) {
  const graph = new Graph();

  graph.addField('product', { id: '1' }, function (shop) {
    shop.addField('title');
  });

  assert.deepEqual(splitQuery(graph.toQuery()), splitQuery('query { product (id: "1") { title } }'));
});

test('it adds connections with pagination info', function (assert) {
  const graph = new Graph();

  graph.addField('shop', {}, function (shop) {
    shop.addField('name');
    shop.addConnection('products', { first: 10 }, function (product) {
      product.addField('handle');
    });
  });

  assert.deepEqual(splitQuery(graph.toQuery()), splitQuery(`query {
    shop {
      name,
      products (first: 10) {
        pageInfo {
          hasNextPage,
          hasPreviousPage
        },
        edges {
          cursor,
          node {
            handle
          }
        }
      }
    }
  }`));
});

test('it adds inline fragments', function (assert) {
  const graph = new Graph();

  graph.addField('shop', {}, function (shop) {
    shop.addInlineFragmentOn('Shop', function (fragment) {
      fragment.addField('name');
    });
  });

  assert.deepEqual(splitQuery(graph.toQuery()), splitQuery(`query {
    shop {
      ... on Shop {
        name
      }
    }
  }`));
});
