import { module, test } from 'qunit';
import { step, resetStep } from 'buy-button-sdk/tests/helpers/assert-step';
import ShopClient from 'buy-button-sdk/shop-client';
import Config from 'buy-button-sdk/config';
import Promise from 'promise';
import CheckoutModel from 'buy-button-sdk/models/checkout-model';

const configAttrs = {
  myShopifyDomain: 'buckets-o-stuff',
  apiKey: 123,
  channelId: 'abc'
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

test('it inits a type\'s adapter with the config during fetchOne', function (assert) {
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

  shopClient.fetchOne('products', 1);
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

test('it inits a type\'s serializer with the config during fetchOne', function (assert) {
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

  shopClient.fetchOne('products', 1).catch(() => {
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

test('it chains the result of the adapter\'s fetchSingle through the type\'s serializer on #fetchOne', function (assert) {
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

  shopClient.fetchOne('products', 1).then(product => {
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

  shopClient.fetchOne('products', 1).catch(() => {
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

test('it forwards "fetchOneNoun" to "fetchOne(\'nouns\', ...)"', function (assert) {
  assert.expect(4);

  const fetchedId = 1;

  shopClient.fetchOne = function (type, id) {
    assert.equal(type, 'products');
    assert.equal(id, fetchedId);
  };

  shopClient.fetchOneProduct(fetchedId);

  shopClient.fetchOne = function (type, id) {
    assert.equal(type, 'collections');
    assert.equal(id, fetchedId);
  };

  shopClient.fetchOneCollection(fetchedId);
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
    checkouts: function (localConfig) {
      assert.equal(localConfig, config);
      FakeAdapter.apply(this, arguments);
    }
  };
  shopClient.serializers = {
    checkouts: FakeSerializer
  };

  shopClient.create('checkouts').then(() => {
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
    checkouts: FakeAdapter
  };

  shopClient.serializers = {
    checkouts: function (localConfig) {
      assert.equal(localConfig, config);
      FakeSerializer.apply(this, arguments);
    }
  };

  shopClient.create('checkouts').then(() => {
    assert.ok(true);
    done();
  }).catch(() => {
    assert.ok(false);
    done();
  });
});

test('it chains the result of the adapter\'s create through the type\'s serializer on #create', function (assert) {
  assert.expect(6);

  const done = assert.async();

  const inputAttrs = { someProps: 'prop' };
  const rawModel = { props: 'some-object' };
  const serializedModel = { attrs: 'serialized-model' };

  shopClient.adapters = {
    checkouts: function () {
      this.create = function (type, attrs) {
        step(1, 'calls create on the adapter', assert);

        assert.equal(attrs, inputAttrs);

        return new Promise(function (resolve) {
          resolve(rawModel);
        });
      };
    }
  };

  shopClient.serializers = {
    checkouts: function () {
      this.deserializeSingle = function (type, results) {
        step(2, 'calls deserializeSingle', assert);

        assert.equal(results, rawModel);

        return serializedModel;
      };
    }
  };

  shopClient.create('checkouts', inputAttrs).then(products => {
    step(3, 'resolves after fetch and serialize', assert);
    assert.equal(products, serializedModel);

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
  const model = new CheckoutModel({
    token: 'abc123',
    someProp: 'some-prop'
  }, {
    shopClient,
    adapter: {
      update(type, id, payload) {
        step(2, 'calls update on the models adapter', assert);
        assert.equal(id, model.attrs.token, 'client extracts the token');
        assert.equal(payload, serializedModel);

        return new Promise(function (resolve) {
          resolve(updatedPayload);
        });
      },
      idKeyForType() {
        return 'token';
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

  // shopClient.adapters = { checkouts: FakeAdapter };
  // shopClient.serializers = { products: FakeSerializer };

  shopClient.update('checkouts', model).then(localUpdatedModel => {
    step(4, 'resolves update with the deserialized model', assert);
    assert.equal(localUpdatedModel, updatedModel);
    done();
  }).catch(e => {
    assert.ok(false);
    done();
  });
});
