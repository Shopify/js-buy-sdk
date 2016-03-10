import PublicationSerializer from './serializers/publication-serializer';
import PublicationAdapter from './adapters/publication-adapter';
import CheckoutSerializer from './serializers/checkout-serializer';
import CheckoutAdapter from './adapters/checkout-adapter';
import CoreObject from './metal/core-object';
import assign from './metal/assign';

/**
 * @module js-buy-sdk
 * @submodule shop-client
 */

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
          return this.fetch(type, ...arguments);
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
  /**
   * @class ShopClient
   * @constructor
   * @param {Config} [config] Config data to be used throughout all API
   * interaction
   */
  constructor(config) {
    this.config = config;

    this.serializers = {
      products: PublicationSerializer,
      collections: PublicationSerializer,
      checkouts: CheckoutSerializer
    };

    this.adapters = {
      products: PublicationAdapter,
      collections: PublicationAdapter,
      checkouts: CheckoutAdapter
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

  /**
   * Fetch all of a `type`, returning a promise.
   *
   * ```javascript
   * client.fetchAll('products').then(products => {
   *   // do things with products
   * });
   * ```
   *
   * @method fetchAll
   * @public
   * @param {String} type The pluralized name of the type, in lower case.
   * @return {Promise|Array} a promise resolving with an array of `type`
   */
  fetchAll(type) {
    const adapter = new this.adapters[type](this.config);

    return adapter.fetchMultiple(type).then(payload => {
      return this.deserialize(type, payload, adapter, { multiple: true });
    });
  },

  /**
   * Fetch one of a `type`, returning a promise.
   *
   * ```javascript
   * client.fetch('products', 123).then(product => {
   *   // do things with the product
   * });
   * ```
   *
   * @method fetch
   * @public
   * @param {String} type The pluralized name of the type, in lower case.
   * @param {String|Number} id a unique identifier
   * @return {Promise|BaseModel} a promise resolving with a single instance of
   * `type` expressed as a `BaseModel`.
   */
  fetch(type, id) {
    const adapter = new this.adapters[type](this.config);

    return adapter.fetchSingle(type, id).then(payload => {
      return this.deserialize(type, payload, adapter, { single: true });
    });
  },

  /**
   * Fetch many of a `type`, that match `query`
   *
   * ```javascript
   * client.fetchQuery('products', { collection_id: 456 }).then(products => {
   *   // do things with the products
   * });
   * ```
   *
   * @method fetchQuery
   * @public
   * @param {String} type The pluralized name of the type, in lower case.
   * @param {Object} query a query sent to the api server.
   * @return {Promise|Array} a promise resolving with an array of `type`.
   */
  fetchQuery(type, query) {
    const adapter = new this.adapters[type](this.config);

    return adapter.fetchMultiple(type, query).then(payload => {
      return this.deserialize(type, payload, adapter, { multiple: true });
    });
  },

  /**
   * Create an instance of `type`, optionally including `attrs`.
   *
   * ```javascript
   * client.create('checkouts', { line_items: [ ... ] }).then(checkout => {
   *   // do things with the checkout.
   * });
   * ```
   *
   * @method create
   * @public
   * @param {String} type The pluralized name of the type, in lower case.
   * @param {Object} [attrs={}] attributes to send to the server for creation.
   * @return {Promise|CartModel} a promise resolving with a single instance of
   * `type`
   */
  create(type, attrs = {}) {
    const adapter = new this.adapters[type](this.config);

    return adapter.create(type, attrs).then(payload => {
      return this.deserialize(type, payload, adapter, { single: true });
    });
  },

  /**
   * Create an instance of `type`, optionally including `attrs`.
   *
   * ```javascript
   * client.create('checkouts', { line_items: [ ... ] }).then(checkout => {
   *   // do things with the checkout.
   * });
   * ```
   *
   * @method update
   * @public
   * @param {String} type The pluralized name of the type, in lower case.
   * @param {BaseModel} updatedModel The model that represents new state to
   * to persist to the server.
   * @return {Promise|CartModel} a promise resolving with a single instance of
   * `type`
   */
  update(type, updatedModel) {
    const adapter = updatedModel.adapter;
    const serializer = updatedModel.serializer;
    const serializedModel = serializer.serialize(type, updatedModel);
    const id = updatedModel.attrs[adapter.idKeyForType(type)];

    return adapter.update(type, id, serializedModel).then(payload => {
      const meta = { shopClient: this, adapter, serializer, type };

      return serializer.deserializeSingle(type, payload, meta);
    });
  },

  /**
   * Proxy to serializer's deserialize.
   *
   * @method deserialize
   * @private
   * @param {String} type The pluralized name of the type, in lower case.
   * @param {Object} payload The raw payload returned by the adapter.
   * @param {BaseAdapter} adapter The adapter that yielded the payload.
   * @param {Object} opts Options that determine which deserialization method to
   * use.
   * @param {Boolean} opts.multiple true when the payload represents multiple
   * models
   * @param {Boolean} opts.single true when the payload represents one model.
   * @return {BaseModel} an instance of `type` reified into a model.
   */
  deserialize(type, payload, adapter, opts = {}) {
    const serializer = new this.serializers[type](this.config);
    const meta = { shopClient: this, adapter, serializer, type };
    let serializedPayload;

    if (opts.multiple) {
      serializedPayload = serializer.deserializeMultiple(type, payload, meta);
    } else {
      serializedPayload = serializer.deserializeSingle(type, payload, meta);
    }

    return serializedPayload;
  },

  /**
   * Convenience wrapper for {{#crossLink "ShopClient/fetchAll:method"}}
   * {{/crossLink}}. Equivalent to:
   *
   * ```javascript
   * client.fetchAll('products');
   * ```
   *
   * @method fetchAllProducts
   * @public
   * @return {Promise|Array} The product models.
   */
  fetchAllProducts: fetchFactory('all', 'products'),

  /**
   * Convenience wrapper for {{#crossLink "ShopClient/fetchAll:method"}}
   * {{/crossLink}}. Equivalent to:
   *
   * ```javascript
   * client.fetchAll('collections');
   * ```
   *
   * @method fetchAllCollections
   * @public
   * @return {Promise|Array} The collection models.
   */
  fetchAllCollections: fetchFactory('all', 'collections'),

  /**
   * Convenience wrapper for {{#crossLink "ShopClient/fetch:method"}}
   * {{/crossLink}}. Equivalent to:
   *
   * ```javascript
   * client.fetch('products', 123);
   * ```
   *
   * @method fetchProduct
   * @public
   * @param {String|Number} id a unique identifier
   * @return {Promise|BaseModel} The product model.
   */
  fetchProduct: fetchFactory('one', 'products'),

  /**
   * Convenience wrapper for {{#crossLink "ShopClient/fetch:method"}}
   * {{/crossLink}}. Equivalent to:
   *
   * ```javascript
   * client.fetch('collections', 123);
   * ```
   *
   * @method fetchCollection
   * @public
   * @param {String|Number} id a unique identifier
   * @return {Promise|BaseModel} The collection model.
   */
  fetchCollection: fetchFactory('one', 'collections'),

  /**
   * Convenience wrapper for {{#crossLink "ShopClient/fetchQuery:method"}}
   * {{/crossLink}}. Equivalent to:
   *
   * ```javascript
   * client.fetchQuery('products', { query: 'options' });
   * ```
   *
   * @method fetchQueryProducts
   * @public
   * @param {Object} query a query sent to the api server.
   * @return {Promise|Array} The product models.
   */
  fetchQueryProducts: fetchFactory('query', 'products'),

  /**
   * Convenience wrapper for {{#crossLink "ShopClient/fetchQuery:method"}}
   * {{/crossLink}}. Equivalent to:
   *
   * ```javascript
   * client.fetchQuery('collections', { query: 'options' });
   * ```
   *
   * @method fetchQueryCollections
   * @public
   * @param {Object} query a query sent to the api server.
   * @return {Promise|Array} The collection models.
   */
  fetchQueryCollections: fetchFactory('query', 'collections')
});

export default ShopClient;
