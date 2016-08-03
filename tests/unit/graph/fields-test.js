import { module, test } from 'qunit';

import fields from 'shopify-buy/graph-helpers/fields';
import ProductSchema from 'graph/types/product';

const querySplitter = /\s+/;

module('Unit | GraphHelpers | fields');

test('it extracts and formats fields from the schema, for a query', function (assert) {
  assert.expect(ProductSchema.fields.length + 1);

  const query = `product {
    ${fields(ProductSchema)}
  }`;

  ProductSchema.fields.forEach(field => {
    assert.ok(query.match(field), `query does not include ${field} from the schema`);
  });

  assert.equal(query.split(querySplitter).length, ProductSchema.fields.length + 3, 'query is not properly formatted');
});
