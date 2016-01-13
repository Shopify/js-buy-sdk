import { module, test } from 'qunit';
import { step, resetStep } from 'buy-button-sdk/tests/helpers/assert-step';
import DataStore from 'buy-button-sdk/data-store';
import Config from 'buy-button-sdk/config';
import { Promise } from 'rsvp';

const configAttrs = {
  myShopifyDomain: 'buckets-o-stuff',
  apiKey: 123,
  channelId: 'abc'
};

const config = new Config(configAttrs);

let dataStore;

function FakeAdapter() {
  this.fetchCollection = function () {
    return new Promise(function (resolve) {
      resolve({});
    });
  };
  this.fetchSingle = function () {
    return new Promise(function (resolve) {
      resolve({});
    });
  };
}

function FakeSerializer() {
  this.serializeSingle = function () {
    return {};
  };
  this.serializeCollection = function () {
    return [{}];
  };
}

module('Unit | DataStore', {
  setup() {
    dataStore = new DataStore(config);
    resetStep();
  },
  teardown() {
    dataStore = null;
  }
});


test('it retains a reference to the passed config.', function (assert) {
  assert.expect(1);

  assert.equal(dataStore.config, config);
});

test('it inits a type\'s adapter with the config during fetchAll', function (assert) {
  assert.expect(1);

  dataStore.adapters = {
    products: function (localConfig) {
      assert.equal(localConfig, config);
      FakeAdapter.apply(this, arguments);
    }
  };
  dataStore.serializers = {
    products: FakeSerializer
  };

  dataStore.fetchAll('products');
});

test('it inits a type\'s adapter with the config during fetchOne', function (assert) {
  assert.expect(1);

  dataStore.adapters = {
    products: function (localConfig) {
      assert.equal(localConfig, config);
      FakeAdapter.apply(this, arguments);
    }
  };
  dataStore.serializers = {
    products: FakeSerializer
  };

  dataStore.fetchOne('products', 1);
});

test('it inits a type\'s adapter with the config during fetchQuery', function (assert) {
  assert.expect(1);

  dataStore.adapters = {
    products: function (localConfig) {
      assert.equal(localConfig, config);
      FakeAdapter.apply(this, arguments);
    }
  };
  dataStore.serializers = {
    products: FakeSerializer
  };

  dataStore.fetchQuery('products', { product_ids: [1, 2, 3] });
});

test('it inits a type\'s serializer with the config during fetchAll', function (assert) {
  assert.expect(1);

  dataStore.adapters = {
    products: FakeAdapter
  };
  dataStore.serializers = {
    products: function (localConfig) {
      assert.equal(localConfig, config);
      FakeSerializer.apply(this, arguments);
    }
  };

  dataStore.fetchAll('products');
});

test('it inits a type\'s serializer with the config during fetchOne', function (assert) {
  assert.expect(1);

  dataStore.adapters = {
    products: FakeAdapter
  };
  dataStore.serializers = {
    products: function (localConfig) {
      assert.equal(localConfig, config);
      FakeSerializer.apply(this, arguments);
    }
  };

  dataStore.fetchOne('products', 1);
});

test('it inits a type\'s serializer with the config during fetchQuery', function (assert) {
  assert.expect(1);

  dataStore.adapters = {
    products: FakeAdapter
  };
  dataStore.serializers = {
    products: function (localConfig) {
      assert.equal(localConfig, config);
      FakeSerializer.apply(this, arguments);
    }
  };

  dataStore.fetchQuery('products', { product_ids: [1, 2, 3] });
});

test('it chains the result of the adapter\'s fetchCollection through the type\'s serializer on #fetchAll', function (assert) {
  assert.expect(5);

  const done = assert.async();

  const rawModel = 'some-object';
  const serializedModel = 'serialized-model';

  dataStore.adapters = {
    products: function () {
      this.fetchCollection = function () {
        step(1, 'calls fetchAll on the adapter', assert);

        return new Promise(function (resolve) {
          resolve(rawModel);
        });
      };
    }
  };

  dataStore.serializers = {
    products: function () {
      this.serializeCollection = function (results) {
        step(2, 'calls serializeCollection', assert);

        assert.equal(results, rawModel);

        return serializedModel;
      };
    }
  };

  dataStore.fetchAll('products').then(products => {
    step(3, 'resolves after fetch and serialize', assert);
    assert.equal(products, serializedModel);

    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});

test('it chains the result of the adapter\'s fetchSingle through the type\'s serializer on #fetchOne', function (assert) {
  assert.expect(6);

  const done = assert.async();

  const rawModel = 'some-object';
  const serializedModel = 'serialized-model';
  const id = 1;

  dataStore.adapters = {
    products: function () {
      this.fetchSingle = function (localId) {
        step(1, 'calls fetchSingle on the adapter', assert);
        assert.equal(localId, id);

        return new Promise(function (resolve) {
          resolve(rawModel);
        });
      };
    }
  };

  dataStore.serializers = {
    products: function () {
      this.serializeSingle = function (results) {
        step(2, 'calls serializeSingle', assert);

        assert.equal(results, rawModel);

        return serializedModel;
      };
    }
  };

  dataStore.fetchOne('products', 1).then(product => {
    step(3, 'resolves after fetch and serialize', assert);
    assert.equal(product, serializedModel);

    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});

test('it chains the result of the adapter\'s fetchCollection through the type\'s serializer on #fetchQuery', function (assert) {
  assert.expect(6);

  const done = assert.async();

  const rawModel = 'some-object';
  const serializedModel = 'serialized-model';
  const query = 'some-query';

  dataStore.adapters = {
    products: function () {
      this.fetchCollection = function (localQuery) {
        step(1, 'calls fetchAll on the adapter', assert);
        assert.equal(localQuery, query);

        return new Promise(function (resolve) {
          resolve(rawModel);
        });
      };
    }
  };

  dataStore.serializers = {
    products: function () {
      this.serializeCollection = function (results) {
        step(2, 'calls serializeCollection', assert);

        assert.equal(results, rawModel);

        return serializedModel;
      };
    }
  };

  dataStore.fetchQuery('products', query).then(products => {
    step(3, 'resolves after fetch and serialize', assert);
    assert.equal(products, serializedModel);

    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});
