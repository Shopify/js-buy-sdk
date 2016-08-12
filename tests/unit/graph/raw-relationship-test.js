import { module, test } from 'qunit';

import rawRelationship from 'shopify-buy/graph-helpers/raw-relationship';
import fields from 'shopify-buy/graph-helpers/fields';
import QueryRoot from 'graph/query-root';

const querySplitter = /[\s,]+/;

function splitQuery(query) {
  return query.split(querySplitter);
}

module('Unit | GraphHelpers | rawRelationship');

test('it wraps the payload from the callback in the query', function (assert) {
  assert.expect(1);

  const query = rawRelationship(QueryRoot, 'shop', () => {
    return 'rando-field';
  });

  assert.deepEqual(splitQuery(query), splitQuery(`shop {
    rando-field
  }`));
});

test('it passes the rawRelationship\'s schema', function (assert) {
  assert.expect(4);

  rawRelationship(QueryRoot, 'shop', shopSchema => {
    assert.ok(typeof shopSchema === 'object');
    assert.ok(typeof shopSchema.fields === 'object');
    assert.ok(typeof shopSchema.fieldsWithArgs === 'object');
    assert.ok(typeof shopSchema.relationships === 'object');
  });
});

test('it returns an enumerable schema that can extract fields', function (assert) {
  let shopFields;

  const shopQuery = rawRelationship(QueryRoot, 'shop', shopSchema => {
    shopFields = Object.keys(shopSchema.fields);

    return fields(shopSchema);
  });

  assert.expect(shopFields.length + 1);

  shopFields.forEach(field => {
    assert.ok(shopQuery.match(field), `query does not include field ${field}`);
  });

  assert.equal(splitQuery(shopQuery).length, shopFields.length + 3, 'query is not properly formatted');
});

test('it takes args', function (assert) {
  assert.expect(1);

  const query = rawRelationship(QueryRoot, 'product', { id: 10 }, () => {
    return 'rando-field';
  });

  assert.deepEqual(splitQuery(query), splitQuery(`product (id: 10) {
    rando-field
  }`));
});

test('it supports empty bodies', function (assert) {
  assert.expect(1);

  const query = rawRelationship(QueryRoot, 'product', { id: 10 });

  assert.deepEqual(splitQuery(query), splitQuery('product (id: 10)'));
});
