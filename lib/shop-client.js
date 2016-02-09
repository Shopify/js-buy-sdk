import ProductSerializer from 'buy-button-sdk/serializers/product-serializer';
import ProductAdapter from 'buy-button-sdk/adapters/product-adapter';
import CollectionSerializer from 'buy-button-sdk/serializers/collection-serializer';
import CollectionAdapter from 'buy-button-sdk/adapters/collection-adapter';
import CoreObject from 'buy-button-sdk/metal/core-object';
import assign from 'buy-button-sdk/metal/assign';

function fetchFactory(fetchType, type) {
  let func;

  switch (fetchType) {
      case 'all':
        func = function () {
          return this.fetchAll(type);
        };
        break;
      case 'one':
        func = function () {
          return this.fetchOne(type, ...arguments);
        };
        break;
      case 'query':
        func = function () {
          return this.fetchQuery(type, ...arguments);
        };
        break;
  }

  return func;
}

const ShopClient = CoreObject.extend({
  constructor(config) {
    this.config = config;

    this.serializers = {
      products: ProductSerializer,
      collections: CollectionSerializer
    };

    this.adapters = {
      products: ProductAdapter,
      collections: CollectionAdapter
    };
  },

  config: null,

  // Prevent leaky state
  get serializers() {
    return assign({}, this.shadowedSerializers);
  },

  set serializers(values) {
    this.shadowedSerializers = assign({}, values);
  },

  get adapters() {
    return assign({}, this.shadowedAdapters);
  },

  set adapters(values) {
    this.shadowedAdapters = assign({}, values);
  },

  fetchAll(type) {
    const adapter = new this.adapters[type](this.config);

    return adapter.fetchCollection().then(payload => {
      return this.deserialize(type, payload, adapter, { collection: true });
    });
  },

  fetchOne(type, id) {
    const adapter = new this.adapters[type](this.config);

    return adapter.fetchSingle(id).then(payload => {
      return this.deserialize(type, payload, adapter, { single: true });
    });
  },

  fetchQuery(type, query) {
    const adapter = new this.adapters[type](this.config);

    return adapter.fetchCollection(query).then(payload => {
      return this.deserialize(type, payload, adapter, { collection: true });
    });
  },

  deserialize(type, payload, adapter, opts = {}) {
    const serializer = new this.serializers[type](this.config);
    const meta = { shopClient: this, adapter, serializer };
    let serializedPayload;

    if (opts.collection) {
      serializedPayload = serializer.deserializeCollection(payload, meta);
    } else {
      serializedPayload = serializer.deserializeSingle(payload, meta);
    }

    return serializedPayload;
  },

  fetchAllProducts: fetchFactory('all', 'products'),
  fetchAllCollections: fetchFactory('all', 'collections'),
  fetchOneProduct: fetchFactory('one', 'products'),
  fetchOneCollection: fetchFactory('one', 'collections'),
  fetchQueryProducts: fetchFactory('query', 'products'),
  fetchQueryCollections: fetchFactory('query', 'collections')
});

export default ShopClient;
