import { module, test } from 'qunit';

import fields from 'shopify-buy/graph-helpers/fields';
import ProductSchema from 'graph/types/product';

const querySplitter = /\s+/;

module('Unit | GraphHelpers | fields');

test('it extracts and formats fields from the schema, for a query', function (assert) {
  assert.expect(Object.keys(ProductSchema.fields).length + 1);

  const query = `product {
    ${fields(ProductSchema)}
  }`;

  Object.keys(ProductSchema.fields).forEach(field => {
    assert.ok(query.match(field), `query does not include ${field} from the schema`);
  });

  assert.equal(query.split(querySplitter).length, Object.keys(ProductSchema.fields).length + 3, 'query is not properly formatted');
});
