import { module, test } from 'qunit';
import { step, resetStep } from 'shopify-buy/tests/helpers/assert-step';
import ShopClient from 'shopify-buy/shop-client';
import Config from 'shopify-buy/config';
import CartModel from 'shopify-buy/models/cart-model';
import { GUID_KEY } from 'shopify-buy/metal/set-guid-for';

const configAttrs = {
  domain: 'buckets-o-stuff.myshopify.com',
  apiKey: 123,
  appId: 6
};

const config = new Config(configAttrs);

let shopClient;

function FakeAdapter() {
  this.fetchMultiple = function () {
    return new Promise(function (resolve) {
      resolve({});
    });
  };
  this.fetchSingle = function () {
    return new Promise(function (resolve) {
      resolve({});
    });
  };
  this.create = function () {
    return new Promise(function (resolve) {
      resolve({});
    });
  };
  this.update = function () {
    return new Promise(function (resolve) {
      resolve({});
    });
  };
}

function FakeSerializer() {
  this.deserializeSingle = function () {
    return {};
  };
  this.deserializeMultiple = function () {
    return [{}];
  };
  this.serialize = function () {
    return {};
  };
  this.modelForType = function () {
    return function () {
    };
  };
}

module('Unit | ShopClient', {
  setup() {
    shopClient = new ShopClient(config);
    resetStep();
  },
  teardown() {
    shopClient = null;
  }
});


test('it retains a reference to the passed config.', function (assert) {
  assert.expect(1);

  assert.equal(shopClient.config, config);
});

test('it inits a type\'s adapter with the config during fetchAll', function (assert) {
  assert.expect(1);

  shopClient.adapters = {
    products: function (localConfig) {
      assert.equal(localConfig, config);
      FakeAdapter.apply(this, arguments);
    }
  };
  shopClient.serializers = {
    products: FakeSerializer
  };

  shopClient.fetchAll('products');
});

test('it inits a type\'s adapter with the config during fetch', function (assert) {
  assert.expect(1);

  shopClient.adapters = {
    products: function (localConfig) {
      assert.equal(localConfig, config);
      FakeAdapter.apply(this, arguments);
    }
  };
  shopClient.serializers = {
    products: FakeSerializer
  };

  shopClient.fetch('products', 1);
});

test('it inits a type\'s adapter with the config during fetchQuery', function (assert) {
  assert.expect(1);

  shopClient.adapters = {
    products: function (localConfig) {
      assert.equal(localConfig, config);
      FakeAdapter.apply(this, arguments);
    }
  };
  shopClient.serializers = {
    products: FakeSerializer
  };

  shopClient.fetchQuery('products', { product_ids: [1, 2, 3] });
});

test('it inits a type\'s serializer with the config during fetchAll', function (assert) {
  assert.expect(1);

  const done = assert.async();

  shopClient.adapters = {
    products: FakeAdapter
  };
  shopClient.serializers = {
    products: function (localConfig) {
      assert.equal(localConfig, config);
      FakeSerializer.apply(this, arguments);
      done();
    }
  };

  shopClient.fetchAll('products').catch(() => {
    assert.ok(false, 'should not reject');
    done();
  });
});

test('it inits a type\'s serializer with the config during fetch', function (assert) {
  assert.expect(1);

  const done = assert.async();

  shopClient.adapters = {
    products: FakeAdapter
  };
  shopClient.serializers = {
    products: function (localConfig) {
      assert.equal(localConfig, config);
      FakeSerializer.apply(this, arguments);
      done();
    }
  };

  shopClient.fetch('products', 1).catch(() => {
    assert.ok(false, 'should not reject');
    done();
  });
});

test('it inits a type\'s serializer with the config during fetchQuery', function (assert) {
  assert.expect(1);

  const done = assert.async();

  shopClient.adapters = {
    products: FakeAdapter
  };
  shopClient.serializers = {
    products: function (localConfig) {
      assert.equal(localConfig, config);
      FakeSerializer.apply(this, arguments);
      done();
    }
  };

  shopClient.fetchQuery('products', { product_ids: [1, 2, 3] }).catch(() => {
    assert.ok(false, 'should not reject');
    done();
  });
});

test('it chains the result of the adapter\'s fetchMultiple through the type\'s serializer on #fetchAll', function (assert) {
  assert.expect(5);

  const done = assert.async();

  const rawModel = { props: 'some-object' };
  const serializedModel = [{ attrs: 'serialized-model' }];

  shopClient.adapters = {
    products: function () {
      this.fetchMultiple = function () {
        step(1, 'calls fetchAll on the adapter', assert);

        return new Promise(function (resolve) {
          resolve(rawModel);
        });
      };
    }
  };

  shopClient.serializers = {
    products: function () {
      this.deserializeMultiple = function (type, results) {
        step(2, 'calls deserializeMultiple', assert);

        assert.equal(results, rawModel);

        return serializedModel;
      };
    }
  };

  shopClient.fetchAll('products').then(products => {
    step(3, 'resolves after fetch and serialize', assert);
    assert.equal(products, serializedModel);

    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});

test('it chains the result of the adapter\'s fetchSingle through the type\'s serializer on #fetch', function (assert) {
  assert.expect(7);

  const done = assert.async();

  const rawModel = { props: 'some-object' };
  const serializedModel = { attrs: 'serialized-model' };
  const id = 1;

  shopClient.adapters = {
    products: function () {
      this.fetchSingle = function (type, localId) {
        step(1, 'calls fetchSingle on the adapter', assert);
        assert.equal(type, 'products');
        assert.equal(localId, id);

        return new Promise(function (resolve) {
          resolve(rawModel);
        });
      };
    }
  };

  shopClient.serializers = {
    products: function () {
      this.deserializeSingle = function (type, results) {
        step(2, 'calls deserializeSingle', assert);

        assert.equal(results, rawModel);

        return serializedModel;
      };
    }
  };

  shopClient.fetch('products', 1).then(product => {
    step(3, 'resolves after fetch and serialize', assert);
    assert.equal(product, serializedModel);

    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});

test('it chains the result of the adapter\'s fetchMultiple through the type\'s serializer on #fetchQuery', function (assert) {
  assert.expect(7);

  const done = assert.async();

  const rawModel = { props: 'some-object' };
  const serializedModel = { attrs: 'serialized-model' };
  const query = { q: 'some-query' };

  shopClient.adapters = {
    products: function () {
      this.fetchMultiple = function (type, localQuery) {
        step(1, 'calls fetchAll on the adapter', assert);
        assert.equal(type, 'products');
        assert.equal(localQuery, query);

        return new Promise(function (resolve) {
          resolve(rawModel);
        });
      };
    }
  };

  shopClient.serializers = {
    products: function () {
      this.deserializeMultiple = function (type, results) {
        step(2, 'calls deserializeMultiple', assert);

        assert.equal(results, rawModel);

        return serializedModel;
      };
    }
  };

  shopClient.fetchQuery('products', query).then(products => {
    step(3, 'resolves after fetch and serialize', assert);
    assert.equal(products, serializedModel);

    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});

test('it passes references to adapter, serializer, and client to the serializer', function (assert) {
  assert.expect(6);

  const done = assert.async();

  shopClient.adapters = {
    products: FakeAdapter
  };

  shopClient.serializers = {
    products: function () {
      this.deserializeSingle = function (type, results, metaAttrs) {
        assert.equal(metaAttrs.shopClient, shopClient, 'client reference to #deserializeSingle');
        assert.equal(metaAttrs.serializer, this, 'serializer reference to #deserializeSingle');
        assert.ok(FakeAdapter.prototype.isPrototypeOf(metaAttrs.adapter), 'adapter reference to #deserializeSingle');

        return {};
      };
      this.deserializeMultiple = function (type, results, metaAttrs) {
        assert.equal(metaAttrs.shopClient, shopClient, 'client reference to #deserializeMultiple');
        assert.equal(metaAttrs.serializer, this, 'serializer reference to #deserializeMultiple');
        assert.ok(FakeAdapter.prototype.isPrototypeOf(metaAttrs.adapter), 'adapter reference to #deserializeMultiple');
        done();

        return [{}];
      };
    }
  };

  shopClient.fetch('products', 1).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
  shopClient.fetchAll('products').catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});

test('it forwards "fetchAllNouns" to "fetchAll(\'nouns\')"', function (assert) {
  assert.expect(2);

  shopClient.fetchAll = function (type) {
    assert.equal(type, 'products');
  };

  shopClient.fetchAllProducts();

  shopClient.fetchAll = function (type) {
    assert.equal(type, 'collections');
  };

  shopClient.fetchAllCollections();
});

test('it forwards "fetchNoun" to "fetch(\'nouns\', ...)"', function (assert) {
  assert.expect(4);

  const fetchedId = 1;

  shopClient.fetch = function (type, id) {
    assert.equal(type, 'products');
    assert.equal(id, fetchedId);
  };

  shopClient.fetchProduct(fetchedId);

  shopClient.fetch = function (type, id) {
    assert.equal(type, 'collections');
    assert.equal(id, fetchedId);
  };

  shopClient.fetchCollection(fetchedId);
});

test('it forwards "fetchQueryNouns" to "fetchQuery(\'nouns\', ...)"', function (assert) {
  assert.expect(4);

  const fetchedQuery = { page: 1 };

  shopClient.fetchQuery = function (type, query) {
    assert.equal(type, 'products');
    assert.deepEqual(query, fetchedQuery);
  };

  shopClient.fetchQueryProducts(fetchedQuery);

  shopClient.fetchQuery = function (type, query) {
    assert.equal(type, 'collections');
    assert.equal(query, fetchedQuery);
  };

  shopClient.fetchQueryCollections(fetchedQuery);
});

test('it inits a type\'s adapter with the config during #create', function (assert) {
  assert.expect(2);

  const done = assert.async();

  shopClient.adapters = {
    carts: function (localConfig) {
      assert.equal(localConfig, config);
      FakeAdapter.apply(this, arguments);
    }
  };
  shopClient.serializers = {
    carts: FakeSerializer
  };

  shopClient.create('carts').then(() => {
    assert.ok(true, 'it resolves the promise');
    done();
  }).catch(() => {
    assert.ok(false);
    done();
  });
});

test('it inits a type\'s serializer with the config during #create', function (assert) {
  assert.expect(2);

  const done = assert.async();

  shopClient.adapters = {
    carts: FakeAdapter
  };

  shopClient.serializers = {
    carts: function (localConfig) {
      assert.equal(localConfig, config);
      FakeSerializer.apply(this, arguments);
    }
  };

  shopClient.create('carts').then(() => {
    assert.ok(true);
    done();
  }).catch(() => {
    assert.ok(false);
    done();
  });
});

test('it chains the result of the adapter\'s create through the type\'s serializer on #create', function (assert) {
  assert.expect(8);

  const done = assert.async();

  const inputAttrs = { someProps: 'prop' };
  const rawModel = { props: 'some-object' };
  const serializedModel = { carts: 'serialized-model' };
  const deserializedModel = { attrs: 'modelAttrs' };

  shopClient.adapters = {
    carts: function () {
      this.create = function (type, attrs) {
        step(2, 'calls create on the adapter', assert);

        assert.equal(attrs, serializedModel);

        return new Promise(function (resolve) {
          resolve(rawModel);
        });
      };
    }
  };

  shopClient.serializers = {
    carts: function () {
      this.deserializeSingle = function (type, results) {
        step(3, 'calls deserializeSingle', assert);

        assert.equal(results, rawModel);

        return deserializedModel;
      };
      this.serialize = function (type, model) {
        step(1, 'calls serialize on the model created from attrs', assert);

        assert.ok(model instanceof CartModel);

        return serializedModel;
      };
      this.modelForType = function () {
        return CartModel;
      };

    }
  };

  shopClient.create('carts', inputAttrs).then(cart => {
    step(4, 'resolves after fetch and serialize', assert);
    assert.equal(cart, deserializedModel);

    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});

test('it utilizes the model\'s adapter and serializer during #update', function (assert) {
  assert.expect(9);

  const done = assert.async();
  const serializedModel = { serializedProps: 'some-values' };
  const updatedPayload = { rawUpdatedProps: 'updated-values' };
  const updatedModel = { updatedProps: 'updated-values' };
  const model = new CartModel({
    someProp: 'some-prop'
  }, {
    shopClient,
    adapter: {
      update(type, id, payload) {
        step(2, 'calls update on the models adapter', assert);
        assert.equal(id, model.attrs[GUID_KEY], 'client extracts the identifier');
        assert.equal(payload, serializedModel);

        return new Promise(function (resolve) {
          resolve(updatedPayload);
        });
      },
      idKeyForType() {
        return GUID_KEY;
      }
    },
    serializer: {
      serialize(type, localModel) {
        step(1, 'calls serialize on the models serializer', assert);
        assert.equal(localModel, model, 'serializer recieves model');

        return serializedModel;
      },
      deserializeSingle(type, singlePayload) {
        step(3, 'calls deserializeSingle with the result of adapter#update', assert);
        assert.equal(singlePayload, updatedPayload);

        return updatedModel;
      }
    }
  });

  model.attrs[GUID_KEY] = 'abc123';

  shopClient.update('carts', model).then(localUpdatedModel => {
    step(4, 'resolves update with the deserialized model', assert);
    assert.equal(localUpdatedModel, updatedModel);
    done();
  }).catch(() => {
    assert.ok(false);
    done();
  });
});

test('it fetches a reference, then a cart on #fetchRecentCart when one exists', function (assert) {
  assert.expect(6);

  const done = assert.async();

  const cartModel = new CartModel();
  const cartId = 12;

  shopClient.fetch = function (type, idOrQuery) {
    if (type === 'references') {
      step(1, 'fetches a reference', assert);

      assert.equal(idOrQuery, `${config.domain}.recent-cart`);

      return new Promise(resolve => {
        resolve({ referenceId: cartId });
      });
    } else if (type === 'carts') {
      step(2, 'fetches a cart', assert);

      assert.equal(idOrQuery, cartId);

      return new Promise(resolve => {
        resolve(cartModel);
      });
    }

    return new Promise((resolve, reject) => {
      const errorMessage = `fetched an unknown type of ${type}`;

      assert.ok(false, errorMessage);
      reject(new Error(errorMessage));
    });
  };

  shopClient.fetchRecentCart().then(cart => {
    step(3, 'it resolves with a cart', assert);
    assert.equal(cart, cartModel);
    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});

test('it fetches a reference and creates a cart on #fetchRecentCart when one does not exist', function (assert) {
  const done = assert.async();

  const cartModel = new CartModel();

  cartModel.attrs[GUID_KEY] = 5;

  shopClient.fetch = function (type, idOrQuery) {
    if (type === 'references') {
      step(1, 'fetches a reference', assert);

      assert.equal(idOrQuery, `${config.domain}.recent-cart`);

      return new Promise((resolve, reject) => {
        reject({});
      });
    }

    return new Promise((resolve, reject) => {
      const errorMessage = `fetched an unknown type of ${type}`;

      assert.ok(false, errorMessage);
      reject(new Error(errorMessage));
    });
  };

  shopClient.create = function (type, attrs) {
    if (type === 'carts') {
      step(2, 'it creates a cart', assert);

      return new Promise(resolve => {
        resolve(cartModel);
      });
    } else if (type === 'references') {
      step(3, 'it creates a reference with the cart id', assert);
      assert.equal(attrs[GUID_KEY], `${config.domain}.recent-cart`);
      assert.equal(attrs.referenceId, cartModel.id);

      return new Promise(resolve => {
        resolve({});
      });
    }

    return new Promise((resolve, reject) => {
      const errorMessage = `an unknown type of ${type}`;

      assert.ok(false, errorMessage);
      reject(new Error(errorMessage));
    });
  };

  shopClient.fetchRecentCart().then(cart => {
    step(4, 'it resolves with a cart', assert);
    assert.equal(cart, cartModel);
    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});

test('it fetches a reference and creates a cart on #fetchRecentCart with broken internal state (reference to nil cart)', function (assert) {
  assert.expect(8);

  const done = assert.async();

  const cartModel = new CartModel();

  cartModel.attrs[GUID_KEY] = 5;

  // Return a reference, but there's no cart
  shopClient.fetch = function (type) {
    if (type === 'references') {
      step(1, 'it fetches a reference', assert);

      return new Promise(resolve => {
        resolve({ referenceId: 5 });
      });
    } else if (type === 'carts') {
      step(2, 'it attempts to fetch a cart', assert);

      return new Promise((resolve, reject) => {
        reject({});
      });
    }

    return new Promise((resolve, reject) => {
      const errorMessage = `fetched an unknown type of ${type}`;

      assert.ok(false, errorMessage);
      reject(new Error(errorMessage));
    });
  };

  // Create a cart, then create a ref
  shopClient.create = function (type, attrs) {
    if (type === 'carts') {
      step(3, 'it creates a cart after failing to find one', assert);

      return new Promise(resolve => {
        resolve(cartModel);
      });
    } else if (type === 'references') {
      step(4, 'it saves a new reference to the cart', assert);

      assert.equal(attrs[GUID_KEY], `${config.domain}.recent-cart`);
      assert.equal(attrs.referenceId, cartModel.id);

      return new Promise(resolve => {
        resolve({});
      });
    }

    return new Promise((resolve, reject) => {
      const errorMessage = `an unknown type of ${type}`;

      assert.ok(false, errorMessage);
      reject(new Error(errorMessage));
    });
  };

  shopClient.fetchRecentCart().then(cart => {
    step(5, 'it resolves with the cart', assert);

    assert.equal(cart, cartModel);
    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});
