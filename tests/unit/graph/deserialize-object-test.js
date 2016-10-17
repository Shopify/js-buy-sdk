import { module, test } from 'qunit';
import GraphModel from 'shopify-buy/graph-helpers/graph-model';
import deserializeObject from 'shopify-buy/graph-helpers/deserialize-object';
import ClassRegistry from 'shopify-buy/graph-helpers/class-registry';


const graphFixture = {
  data: {
    shop: {
      name: 'buckets-o-stuff',
      products: {
        pageInfo: {
          hasPreviousPage: false,
          hasNextPage: false
        },
        edges: [
          {
            cursor: 'eyJsYXN0X2lkIjozNjc3MTg5ODg5LCJsYXN0X3ZhbHVlIjoiMzY3NzE4OTg4OSJ9',
            node: {
              handle: 'aluminum-pole'
            }
          },
          {
            cursor: 'eyJsYXN0X2lkIjozNjgwODg2NzIxLCJsYXN0X3ZhbHVlIjoiMzY4MDg4NjcyMSJ9',
            node: {
              handle: 'electricity-socket-with-jam'
            }
          },
          {
            cursor: 'eyJsYXN0X2lkIjo0MTQwMTI3MDQxLCJsYXN0X3ZhbHVlIjoiNDE0MDEyNzA0MSJ9',
            node: {
              handle: 'borktown'
            }
          }
        ]
      }
    }
  }
};

const productFixture = {
  data: {
    product: {
      id: 'gid://shopify/Product/3677189889',
      handle: 'aluminum-pole',
      options: [
        {
          name: 'Color'
        },
        {
          name: 'Size'
        }
      ],
      images: {
        edges: [
          {
            node: {
              src: 'https://cdn.shopify.com/s/files/1/1090/1932/products/festivus-pole-the-strike-seinfeld.jpg?v=1449866700'
            }
          },
          {
            node: {
              src: 'https://cdn.shopify.com/s/files/1/1090/1932/products/giphy.gif?v=1450204755'
            }
          }
        ]
      }
    }
  }
};

module('Unit | GraphHelpers | deserializeObject');

test('it creates a GraphModel from the root type', function (assert) {
  assert.expect(1);

  const graph = deserializeObject(graphFixture.data, 'QueryRoot');

  assert.ok(GraphModel.prototype.isPrototypeOf(graph), 'root type is a graph model');
});

test('it instantiates a model with relationship fields', function (assert) {
  assert.expect(2);

  const graph = deserializeObject(graphFixture.data, 'QueryRoot');

  assert.ok(GraphModel.prototype.isPrototypeOf(graph.shop), 'shop relationship is a graph model');
  assert.deepEqual(graph.shop.attrs, { name: 'buckets-o-stuff' }, 'shop model contains payloads attrs');
});

test('it creates an array from lists of paginated relationships', function (assert) {
  assert.expect(2);

  const graph = deserializeObject(graphFixture.data, 'QueryRoot');

  assert.ok(Array.isArray(graph.shop.products), 'shops products are in an array');
  assert.equal(graph.shop.products.length, 3, 'there are three products');
});

test('it instantiates paginated list members as models', function (assert) {
  assert.expect(graphFixture.data.shop.products.edges.length * 2);

  const graph = deserializeObject(graphFixture.data, 'QueryRoot');

  graphFixture.data.shop.products.edges.forEach((product, index) => {
    assert.ok(GraphModel.prototype.isPrototypeOf(graph.shop.products[index]), 'products are graph models');
    assert.equal(graph.shop.products[index].attrs.handle, product.node.handle, 'products contain payload attrs');
  });
});

test('it creates an array from lists of non-paginated relationships', function (assert) {
  assert.expect(2);

  const graph = deserializeObject(productFixture.data, 'QueryRoot');

  assert.ok(Array.isArray(graph.product.options), 'products images are in an array');
  assert.equal(graph.product.options.length, 2, 'there are two options');
});

test('it instantiates basic list members as models', function (assert) {
  assert.expect(2);

  const graph = deserializeObject(productFixture.data, 'QueryRoot');

  assert.ok(GraphModel.prototype.isPrototypeOf(graph.product.options[0]));
  assert.equal(graph.product.options[0].name, productFixture.data.product.options[0].name);
});

test('it instantiates types with their registered models', function (assert) {
  const registry = new ClassRegistry();

  class ShopModel extends GraphModel { }

  class ProductModel extends GraphModel { }

  registry.registerClassForType(ShopModel, 'Shop');
  registry.registerClassForType(ProductModel, 'Product');

  const graph = deserializeObject(graphFixture.data, 'QueryRoot', registry);

  assert.ok(ShopModel.prototype.isPrototypeOf(graph.shop), 'shop node is a shop model');
  assert.ok(ProductModel.prototype.isPrototypeOf(graph.shop.products[0]), 'product node is a product model');
});
