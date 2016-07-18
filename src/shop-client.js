import ListingsSerializer from './serializers/listings-serializer';
import ListingsAdapter from './adapters/listings-adapter';
import CartSerializer from './serializers/cart-serializer';
import ReferenceSerializer from './serializers/reference-serializer';
import LocalStorageAdapter from './adapters/local-storage-adapter';
import CoreObject from './metal/core-object';
import assign from './metal/assign';
import { GUID_KEY } from './metal/set-guid-for';

/**
 * @module shopify-buy
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
      products: ListingsSerializer,
      collections: ListingsSerializer,
      carts: CartSerializer,
      references: ReferenceSerializer
    };

    this.adapters = {
      products: ListingsAdapter,
      collections: ListingsAdapter,
      carts: LocalStorageAdapter,
      references: LocalStorageAdapter
    };
  },

  config: null,

  /**
   * @attribute
   * @default {
   *  products: ListingsAdapter,
   *  collections: ListingsAdapter,
   *  carts: CartAdapter
   * }
   * @type Object
   * @protected
   */
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
   * @private
   * @param {String} type The pluralized name of the type, in lower case.
   * @return {Promise|Array} a promise resolving with an array of `type`
   */
  fetchAll(type) {
    const adapter = new this.adapters[type](this.config);

    return adapter.fetchMultiple(type).then(payload => {
      return this.deserialize(type, payload, adapter, null, { multiple: true });
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
   * @private
   * @param {String} type The pluralized name of the type, in lower case.
   * @param {String|Number} id a unique identifier
   * @return {Promise|BaseModel} a promise resolving with a single instance of
   * `type` expressed as a `BaseModel`.
   */
  fetch(type, id) {
    const adapter = new this.adapters[type](this.config);

    return adapter.fetchSingle(type, id).then(payload => {
      return this.deserialize(type, payload, adapter, null, { single: true });
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
   * @private
   * @param {String} type The pluralized name of the type, in lower case.
   * @param {Object} query a query sent to the api server.
   * @return {Promise|Array} a promise resolving with an array of `type`.
   */
  fetchQuery(type, query) {
    const adapter = new this.adapters[type](this.config);

    return adapter.fetchMultiple(type, query).then(payload => {
      return this.deserialize(type, payload, adapter, null, { multiple: true });
    });
  },

  /**
   * Create an instance of `type`, optionally including `modelAttrs`.
   *
   * ```javascript
   * client.create('carts', { line_items: [ ... ] }).then(cart => {
   *   // do things with the cart.
   * });
   * ```
   *
   * @method create
   * @private
   * @param {String} type The pluralized name of the type, in lower case.
   * @param {Object} [modelAttrs={}] attributes representing the internal state
   * of the model to be persisted.
   * @return {Promise|CartModel} a promise resolving with a single instance of
   * `type`
   */
  create(type, modelAttrs = {}) {
    const adapter = new this.adapters[type](this.config);
    const serializer = new this.serializers[type](this.config);
    const Model = serializer.modelForType(type);
    const model = new Model(modelAttrs, { shopClient: this });
    const attrs = serializer.serialize(type, model);

    return adapter.create(type, attrs).then(payload => {
      return this.deserialize(type, payload, adapter, serializer, { single: true });
    });
  },

  /**
   * Create an instance of `type`, optionally including `attrs`.
   *
   * ```javascript
   * client.create('carts', { line_items: [ ... ] }).then(cart => {
   *   // do things with the cart.
   * });
   * ```
   *
   * @method update
   * @private
   * @param {String} type The pluralized name of the type, in lower case.
   * @param {BaseModel} updatedModel The model that represents new state to
   * to persist.
   * @return {Promise|CartModel} a promise resolving with a single instance of
   * `type`
   */
  update(type, updatedModel) {
    const adapter = updatedModel.adapter;
    const serializer = updatedModel.serializer;
    const serializedModel = serializer.serialize(type, updatedModel);
    const id = updatedModel.attrs[adapter.idKeyForType(type)];

    return adapter.update(type, id, serializedModel).then(payload => {
      return this.deserialize(type, payload, adapter, serializer, { single: true });
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
   * @param {BaseSerializer} existingSerializer The serializer to attach. If
   * none is passed, then `this.deserialize` will create one for the type.
   * @param {Object} opts Options that determine which deserialization method to
   * use.
   * @param {Boolean} opts.multiple true when the payload represents multiple
   * models
   * @param {Boolean} opts.single true when the payload represents one model.
   * @return {BaseModel} an instance of `type` reified into a model.
   */
  deserialize(type, payload, adapter, existingSerializer, opts = {}) {
    const serializer = (existingSerializer || new this.serializers[type](this.config));
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
    * Creates a {{#crossLink "CartModel"}}CartModel{{/crossLink}} instance, optionally including `attrs`.
    *
    * ```javascript
    * client.createCart().then(cart => {
    *   // do something with cart
    * });
    * ```
    *
    * @param {Object}[attrs={}] attributes representing the internal state of the cart to be persisted to localStorage.
    * @method createCart
    * @public
    * @return {Promise|CartModel} - new cart instance.
  */
  createCart(userAttrs = {}) {
    const baseAttrs = {
      line_items: []
    };
    const attrs = {};

    assign(attrs, baseAttrs);
    assign(attrs, userAttrs);

    return this.create('carts', attrs);
  },

  /**
    * Updates an existing {{#crossLink "CartModel"}}CartModel{{/crossLink}} instance and persists it to localStorage.
    *
    * ```javascript
    * client.createCart().then(cart => {
    *   cart.lineItems = [
    *     // ...
    *   ];
    *   client.updateCart(cart);
    * });
    * ```
    *
    * @param {Object}[attrs={}] attributes representing the internal state of the cart to be persisted to localStorage.
    * @method updateCart
    * @public
    * @return {Promise|CartModel} - updated cart instance.
  */
  updateCart(updatedCart) {
    return this.update('carts', updatedCart);
  },

  /**
   * Retrieve a previously created cart by its key.
   *
   * ```javascript
   * client.fetchCart('shopify-buy.1459804699118.2').then(cart => {
   *   console.log(cart); // The retrieved cart
   * });
   *
   * @method fetchCart
   * @public
   * @param {String} id The cart's unique identifier
   * @return {Promise|CartModel} The cart model.
   *
   */
  fetchCart: fetchFactory('one', 'carts'),

  /**
   * Convenience wrapper for {{#crossLink "ShopClient/fetchAll:method"}}
   * {{/crossLink}}. Equivalent to:
   *
   * ```javascript
   * client.fetchAll('products');
   * ```
   *
   * @method fetchAllProducts
   * @private
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
   * @private
   * @return {Promise|Array} The collection models.
   */
  fetchAllCollections: fetchFactory('all', 'collections'),

  /**
   * Fetch one product by its ID.
   *
   * ```javascript
   * client.fetchProduct(123).then(product => {
   *   console.log(product); // The product with an ID of 123
   * });
   * ```
   *
   * @method fetchProduct
   * @public
   * @param {String|Number} id a unique identifier
   * @return {Promise|BaseModel} The product model with the specified ID.
   */
  fetchProduct: fetchFactory('one', 'products'),

  /**
   * Fetch one collection by its ID.
   *
   * ```javascript
   * client.fetchCollection(123).then(collection => {
   *   console.log(collection); // The collection with an ID of 123
   * });
   * ```
   *
   * @method fetchCollection
   * @public
   * @param {String|Number} id a unique identifier
   * @return {Promise|BaseModel} The collection model with the specified ID.
   */
  fetchCollection: fetchFactory('one', 'collections'),

  /**
   * Fetches a list of products matching a specified query.
   *
   * ```javascript
   * client.fetchQueryProducts({ collection_id: 123, tag: ['hats'] }).then(products => {
   *   console.log(products); // An array of products in collection `123` having the tag `hats`
   * });
   * ```
   * @method fetchQueryProducts
   * @public
   * @param {Object} query A query sent to the api server containing one or more of:
   *   @param {String|Number} [query.collection_id] The ID of a collection to retrieve products from
   *   @param {Array} [query.tag] A list of tags to filter the products by. Accepts up to 10 tags.
   *   @param {Array} [query.product_ids] A list of product IDs to retrieve
   *   @param {String|Number} [query.page=1] The page offset number of the current lookup (based on the `limit`)
   *   @param {String|Number} [query.limit=50] The number of products to retrieve per page
   *   @param {String} [query.handle] The handle of the product to look up
   *   @param {String} [query.updated_at_min] Products updated since the supplied timestamp (format: 2008-12-31 03:00)
   * @return {Promise|Array} The product models.
   */
  fetchQueryProducts: fetchFactory('query', 'products'),

  /**
   * Fetches a list of collections matching a specified query.
   *
   * ```javascript
   * client.fetchQueryCollections({page: 2, limit: 20}).then(collections => {
   *   console.log(collections); // An array of collection resources
   * });
   * ```
   *
   * @method fetchQueryCollections
   * @public
   * @param {Object} query a query sent to the api server.
   *   @param {String|Number} [query.page=1] the page offset number of the current lookup (based on the `limit`)
   *   @param {String|Number} [query.limit=50] the number of collections to retrieve per page
   * @return {Promise|Array} The collection models.
   */
  fetchQueryCollections: fetchFactory('query', 'collections'),


  /**
   * This method looks up a reference in localStorage to the most recent cart.
   * If one is not found, creates one. If the cart the reference points to
   * doesn't exist, create one and store the new reference.
   *
   * ```javascript
   * client.fetchRecentCart().then(cart => {
   *  // do stuff with the cart
   * });
   * ```
   *
   * @method fetchRecentCart
   * @public
   * @return {Promise|CartModel} The cart.
   */
  fetchRecentCart() {
    return this.fetch('references', `${this.config.domain}.recent-cart`).then(reference => {
      const cartId = reference.referenceId;

      return this.fetchCart(cartId);
    }).catch(() => {
      return this.createCart().then(cart => {
        const refAttrs = {
          referenceId: cart.id
        };

        refAttrs[GUID_KEY] = `${this.config.domain}.recent-cart`;

        this.create('references', refAttrs);

        return cart;
      });
    });
  }
});

export default ShopClient;
