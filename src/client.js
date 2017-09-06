import GraphQLJSClient from './graphql-client';
import Config from './config';
import handleCheckoutMutation from './handle-checkout-mutation';
import productHelpers from './product-helpers';
import imageHelpers from './image-helpers';
import defaultResolver from './default-resolver';
import fetchResourcesForProducts from './fetch-resources-for-products';
import {version} from '../package.json';
// Graphql
import types from '../schema.json';
import checkoutNodeQuery from './graphql/checkoutNodeQuery.graphql';
import productNodeQuery from './graphql/productNodeQuery.graphql';
import productConnectionQuery from './graphql/productConnectionQuery.graphql';
import productByHandleQuery from './graphql/productByHandleQuery.graphql';
import collectionNodeQuery from './graphql/collectionNodeQuery.graphql';
import collectionNodeWithProductsQuery from './graphql/collectionNodeWithProductsQuery.graphql';
import collectionConnectionQuery from './graphql/collectionConnectionQuery.graphql';
import collectionConnectionWithProductsQuery from './graphql/collectionConnectionWithProductsQuery.graphql';
import collectionByHandleQuery from './graphql/collectionByHandleQuery.graphql';
import shopQuery from './graphql/shopQuery.graphql';
import shopPolicyQuery from './graphql/shopPolicyQuery.graphql';
import checkoutCreateMutation from './graphql/checkoutCreateMutation.graphql';
import checkoutLineItemsAddMutation from './graphql/checkoutLineItemsAddMutation.graphql';
import checkoutLineItemsRemoveMutation from './graphql/checkoutLineItemsRemoveMutation.graphql';
import checkoutLineItemsUpdateMutation from './graphql/checkoutLineItemsUpdateMutation.graphql';

function paginateProductConnectionsAndResolve(client) {
  return function(products) {
    return fetchResourcesForProducts(products, client).then(() => {
      return products;
    });
  };
}

function paginateCollectionsProductConnectionsAndResolve(client) {
  return function(collectionOrCollections) {
    const collections = [].concat(collectionOrCollections);

    return Promise.all(collections.reduce((promiseAcc, collection) => {
      return promiseAcc.concat(fetchResourcesForProducts(collection.products, client));
    }, [])).then(() => {
      return collectionOrCollections;
    });
  };
}

/**
 * The JS Buy SDK Client.
 * @class
 */
class Client {

  /**
   * A namespace providing utilities for product resources.
   * @namespace
   */
  static get Product() {
    return {
      Helpers: productHelpers
    };
  }

  /**
   * A namespace providing utilities for image resources.
   * @namespace
   */
  static get Image() {
    return {
      Helpers: imageHelpers
    };
  }

  /**
   * Primary entry point for building a new Client.
   */
  static buildClient(config) {
    const newConfig = new Config(config);

    return new Client(newConfig);
  }

  /**
   * @constructs Client
   * @param {Config} config An instance of {@link Config} used to configure the Client.
   */
  constructor(config, GraphQLClientClass = GraphQLJSClient) {
    const apiUrl = `https://${config.domain}/api/graphql`;

    this.graphQLClient = new GraphQLClientClass(types, {
      url: apiUrl,
      fetcherOptions: {
        headers: {
          'X-SDK-Variant': 'javascript',
          'X-SDK-Version': version,
          'X-Shopify-Storefront-Access-Token': config.storefrontAccessToken
        }
      }
    });
  }

  /**
   * Fetches shop information (`currencyCode`, `description`, `moneyFormat`, `name`, and `primaryDomain`).
   * See the {@link https://help.shopify.com/api/storefront-api/reference/object/shop|Storefront API reference} for more information.
   *
   * @example
   * client.fetchShopInfo().then((shop) => {
   *   // Do something with the shop
   * });
   *
   * @return {Promise|GraphModel} A promise resolving with a `GraphModel` of the shop.
   */
  fetchShopInfo() {
    return this.graphQLClient
      .send(shopQuery)
      .then(defaultResolver('shop'));
  }

  /**
   * Fetches shop policies (privacy policy, terms of service and refund policy).
   *
   * @example
   * client.fetchShopPolicies().then((shop) => {
   *   // Do something with the shop
   * });
   *
   * @return {Promise|GraphModel} A promise resolving with a `GraphModel` of the shop.
   */
  fetchShopPolicies() {
    return this.graphQLClient
      .send(shopPolicyQuery)
      .then(defaultResolver('shop'));
  }

  /**
   * Fetches all products on the shop.
   *
   * @example
   * client.fetchAllProducts().then((products) => {
   *   // Do something with the products
   * });
   *
   * @param {Client.Queries.productConnectionQuery} [query] Callback function to specify fields to query on the products.
   * @return {Promise|GraphModel[]} A promise resolving with an array of `GraphModel`s of the products.
   */
  fetchAllProducts(pageSize = 20) {
    return this.graphQLClient
      .send(productConnectionQuery, {pageSize})
      .then(defaultResolver('shop.products'))
      .then(paginateProductConnectionsAndResolve(this.graphQLClient));
  }

  /**
   * Fetches a single product by ID on the shop.
   *
   * @example
   * client.fetchProduct('Xk9lM2JkNzFmNzIQ4NTIY4ZDFi9DaGVja291dC9lM2JkN==').then((product) => {
   *   // Do something with the product
   * });
   *
   * @param {String} id The id of the product to fetch.
   * @param {Client.Queries.productNodeQuery} [query] Callback function to specify fields to query on the product.
   * @return {Promise|GraphModel} A promise resolving with a `GraphModel` of the product.
   */
  fetchProduct(id) {
    return this.graphQLClient
      .send(productNodeQuery, {id})
      .then(defaultResolver('node'))
      .then(paginateProductConnectionsAndResolve(this.graphQLClient));
  }

  /**
   * Fetches a single product by handle on the shop.
   *
   * @example
   * client.fetchProductByHandle('my-product').then((product) => {
   *   // Do something with the product
   * });
   *
   * @param {String} handle The handle of the product to fetch.
   * @return {Promise|GraphModel} A promise resolving with a `GraphModel` of the product.
   */
  fetchProductByHandle(handle) {
    return this.graphQLClient
      .send(productByHandleQuery, {handle})
      .then(defaultResolver('shop.productByHandle'))
      .then(paginateProductConnectionsAndResolve(this.graphQLClient));
  }

  /**
   * Fetches a collection by handle on the shop.
   *
   * @example
   * client.fetchCollectionByHandle('my-collection').then((collection) => {
   *   // Do something with the collection
   * });
   *
   * @param {String} handle The handle of the collection to fetch.
   * @return {Promise|GraphModel} A promise resolving with a `GraphModel` of the collection.
   */
  fetchCollectionByHandle(handle) {
    return this.graphQLClient
      .send(collectionByHandleQuery, {handle})
      .then(defaultResolver('shop.collectionByHandle'));
  }

  /**
   * Fetches all collections on the shop, not including products.
   * To fetch collections with products use [fetchAllCollectionsWithProducts]{@link Client#fetchAllCollectionsWithProducts}.
   *
   * @example
   * client.fetchAllCollections().then((collections) => {
   *   // Do something with the collections
   * });
   *
   * @param {Client.Queries.collectionConnectionQuery} [query] Callback function to specify fields to query on the collections.
   * @return {Promise|GraphModel[]} A promise resolving with an array of `GraphModel`s of the collections.
   */
  fetchAllCollections() {
    return this.graphQLClient
      .send(collectionConnectionQuery)
      .then(defaultResolver('shop.collections'));
  }

  /**
   * Fetches all collections on the shop, including products.
   *
   * @example
   * client.fetchAllCollectionsWithProducts().then((collections) => {
   *   // Do something with the collections
   * });
   *
   * @return {Promise|GraphModel[]} A promise resolving with an array of `GraphModel`s of the collections.
   */
  fetchAllCollectionsWithProducts({first = 20, productsFirst = 20} = {}) {
    return this.graphQLClient
      .send(collectionConnectionWithProductsQuery, {first, productsFirst})
      .then(defaultResolver('shop.collections'))
      .then(paginateCollectionsProductConnectionsAndResolve(this.graphQLClient));
  }

  /**
   * Fetches a single collection by ID on the shop, not including products.
   * To fetch the collection with products use [fetchCollectionWithProducts]{@link Client#fetchCollectionWithProducts}.
   *
   * @example
   * client.fetchCollection('Xk9lM2JkNzFmNzIQ4NTIY4ZDFiZTUyZTUwNTE2MDNhZjg==').then((collection) => {
   *   // Do something with the collection
   * });
   *
   * @param {String} id The id of the collection to fetch.
   * @param {Client.Queries.collectionNodeQuery} [query] Callback function to specify fields to query on the collection.
   * @return {Promise|GraphModel} A promise resolving with a `GraphModel` of the collection.
   */
  fetchCollection(id) {
    return this.graphQLClient
      .send(collectionNodeQuery, {id})
      .then(defaultResolver('node'));
  }

  /**
   * Fetches a single collection by ID on the shop, including products.
   *
   * @example
   * client.fetchCollectionWithProducts('Xk9lM2JkNzFmNzIQ4NTIY4ZDFiZTUyZTUwNTE2MDNhZjg==').then((collection) => {
   *   // Do something with the collection
   * });
   *
   * @param {String} id The id of the collection to fetch.
   * @return {Promise|GraphModel} A promise resolving with a `GraphModel` of the collection.
   */
  fetchCollectionWithProducts(id, productsFirst = 20) {
    return this.graphQLClient
      .send(collectionNodeWithProductsQuery, {id, productsFirst})
      .then(defaultResolver('node'))
      .then(paginateCollectionsProductConnectionsAndResolve(this.graphQLClient));
  }

  /**
   * Fetches a checkout by ID.
   *
   * @example
   * client.fetchCheckout('FlZj9rZXlN5MDY4ZDFiZTUyZTUwNTE2MDNhZjg=').then((checkout) => {
   *   // Do something with the checkout
   * });
   *
   * @param {String} id The id of the checkout to fetch.
   * @param {Client.Queries.checkoutNodeQuery} [query] Callback function to specify fields to query on the checkout.
   * @return {Promise|GraphModel} A promise resolving with a `GraphModel` of the checkout.
   */
  fetchCheckout(id) {
    return this.graphQLClient
      .send(checkoutNodeQuery, {id})
      .then(defaultResolver('node'))
      .then((checkout) => {
        return this.graphQLClient.fetchAllPages(checkout.lineItems, {pageSize: 250}).then((lineItems) => {
          checkout.attrs.lineItems = lineItems;

          return checkout;
        });
      });
  }

  /**
   * Fetches all products on the shop that match the query.
   *
   * @example
   * client.fetchQueryProducts({sortBy: 'title', limit: 10}).then((products) => {
   *   // Do something with the first 10 products sorted by title in ascending order
   * });
   *
   * @param {Object} [queryObject] An object specifying the query data containing zero or more of:
   *   @param {String} [queryObject.title] The title of the product to fetch.
   *   @param {String} [queryObject.updatedAtMin] Products updated since the supplied timestamp (format: `2016-09-25T21:31:33`).
   *   @param {String} [queryObject.createdAtMin] Products created since the supplied timestamp (format: `2016-09-25T21:31:33`).
   *   @param {String} [queryObject.productType] The type of products to fetch.
   *   @param {Number} [queryObject.limit=20] The number of products to fetch.
   *   @param {String} [queryObject.sortBy] The field to use to sort products. Possible values are `title`, `updatedAt`, and `createdAt`.
   *   @param {String} [queryObject.sortDirection] The sort direction of the products.
   *     Will sort products by ascending order unless `'desc'` is specified.
   * @param {Client.Queries.productConnectionQuery} [query] Callback function to specify fields to query on the products.
   * @return {Promise|GraphModel[]} A promise resolving with an array of `GraphModel`s of the products.
   */
  fetchQueryProducts({first = 20, sortKey = 'ID', query, reverse}) {
    return this.graphQLClient
      .send(productConnectionQuery, {
        first,
        sortKey: this.graphQLClient.enum(sortKey),
        query,
        reverse
      })
      .then(defaultResolver('shop.products'))
      .then(paginateProductConnectionsAndResolve(this.graphQLClient));
  }

  /**
   * Fetches all collections on the shop that match the query.
   *
   * @example
   * client.fetchQueryCollections({sortBy: 'title', limit: 10}).then((collections) => {
   *   // Do something with the first 10 collections sorted by title in ascending order
   * });
   *
   * @param {Object} [queryObject] An object specifying the query data containing zero or more of:
   *   @param {String} [queryObject.title] The title of the collection to fetch.
   *   @param {String} [queryObject.updatedAtMin] Collections updated since the supplied timestamp (format: `2016-09-25T21:31:33`).
   *   @param {Number} [queryObject.limit=20] The number of collections to fetch.
   *   @param {String} [queryObject.sortBy] The field to use to sort collections. Possible values are `title` and `updatedAt`.
   *   @param {String} [queryObject.sortDirection] The sort direction of the collections.
   *     Will sort collections by ascending order unless `'desc'` is specified.
   * @param {Client.Queries.collectionConnectionQuery} [query] Callback function to specify fields to query on the collections.
   * @return {Promise|GraphModel[]} A promise resolving with an array of `GraphModel`s of the collections.
   */
  fetchQueryCollections({first = 20, sortKey = 'ID', query, reverse}) {
    return this.graphQLClient.send(collectionConnectionQuery, {
      first,
      sortKey: this.graphQLClient.enum(sortKey),
      query,
      reverse
    }).then(defaultResolver('shop.collections'));
  }

  /**
   * Creates a checkout.
   *
   * @example
   * const input = {
   *   lineItems: [
   *     {variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8yOTEwNjAyMjc5Mg==', quantity: 5}
   *   ]
   * };
   *
   * client.createCheckout(input).then((checkout) => {
   *   // Do something with the newly created checkout
   * });
   *
   * @param {Object} [input] An input object containing zero or more of:
   *   @param {String} [input.email] An email connected to the checkout.
   *   @param {Object[]} [input.lineItems] A list of line items in the checkout. See the {@link https://help.shopify.com/api/storefront-api/reference/input_object/checkoutlineiteminput|Storefront API reference} for valid input fields for each line item.
   *   @param {Object} [input.shippingAddress] A shipping address. See the {@link https://help.shopify.com/api/storefront-api/reference/input_object/mailingaddressinput|Storefront API reference} for valid input fields.
   *   @param {String} [input.note] A note for the checkout.
   *   @param {Object[]} [input.customAttributes] A list of custom attributes for the checkout. See the {@link https://help.shopify.com/api/storefront-api/reference/input_object/attributeinput|Storefront API reference} for valid input fields.
   * @param {Client.Queries.checkoutQuery} [query] Callback function to specify fields to query on the checkout returned.
   * @return {Promise|GraphModel} A promise resolving with the created checkout.
   */
  createCheckout(input = {}) {
    return this.graphQLClient
      .send(checkoutCreateMutation, {input})
      .then(handleCheckoutMutation('checkoutCreate', this.graphQLClient));
  }

  /**
   * Adds line items to an existing checkout.
   *
   * @example
   * const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9kMTZmM2EzMDM4Yjc4N=';
   * const lineItems = [{variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8yOTEwNjAyMjc5Mg==', quantity: 5}];
   *
   * client.addLineItems(checkoutId, lineItems).then((checkout) => {
   *   // Do something with the updated checkout
   * });
   *
   * @param {String} checkoutId The ID of the checkout to add line items to.
   * @param {Object[]} lineItems A list of line items to add to the checkout. See the {@link https://help.shopify.com/api/storefront-api/reference/input_object/checkoutlineiteminput|Storefront API reference} for valid input fields for each line item.
   * @param {Client.Queries.checkoutQuery} [query] Callback function to specify fields to query on the checkout returned.
   * @return {Promise|GraphModel} A promise resolving with the updated checkout.
   */
  addLineItems(checkoutId, lineItems) {
    return this.graphQLClient
      .send(checkoutLineItemsAddMutation, {checkoutId, lineItems})
      .then(handleCheckoutMutation('checkoutLineItemsAdd', this.graphQLClient));
  }

  /**
   * Removes line items from an existing checkout.
   *
   * @example
   * const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9kMTZmM2EzMDM4Yjc4N=';
   * const lineItemIds = ['TViZGE5Y2U1ZDFhY2FiMmM2YT9rZXk9NTc2YjBhODcwNWIxYzg0YjE5ZjRmZGQ5NjczNGVkZGU='];
   *
   * client.removeLineItems(checkoutId, lineItemIds).then((checkout) => {
   *   // Do something with the updated checkout
   * });
   *
   * @param {String} checkoutId The ID of the checkout to remove line items from.
   * @param {String[]} lineItemIds A list of the ids of line items to remove from the checkout.
   * @param {Client.Queries.checkoutQuery} [query] Callback function to specify fields to query on the checkout returned.
   * @return {Promise|GraphModel} A promise resolving with the updated checkout.
   */
  removeLineItems(checkoutId, lineItemIds) {
    return this.graphQLClient
      .send(checkoutLineItemsRemoveMutation, {checkoutId, lineItemIds})
      .then(handleCheckoutMutation('checkoutLineItemsRemove', this.graphQLClient));
  }

  /**
   * Updates line items on an existing checkout.
   *
   * @example
   * const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9kMTZmM2EzMDM4Yjc4N=';
   * const lineItems = [
   *   {
   *     id: 'TViZGE5Y2U1ZDFhY2FiMmM2YT9rZXk9NTc2YjBhODcwNWIxYzg0YjE5ZjRmZGQ5NjczNGVkZGU=',
   *     quantity: 5,
   *     variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8yOTEwNjAyMjc5Mg=='
   *   }
   * ];
   *
   * client.updateLineItems(checkoutId, lineItems).then(checkout => {
   *   // Do something with the updated checkout
   * });
   *
   * @param {String} checkoutId The ID of the checkout to update a line item on.
   * @param {Object[]} lineItems A list of line item information to update. See the {@link https://help.shopify.com/api/storefront-api/reference/input_object/checkoutlineitemupdateinput|Storefront API reference} for valid input fields for each line item.
   * @param {Client.Queries.checkoutQuery} [query] Callback function to specify fields to query on the checkout returned.
   * @return {Promise|GraphModel} A promise resolving with the updated checkout.
   */
  updateLineItems(checkoutId, lineItems) {
    return this.graphQLClient
      .send(checkoutLineItemsUpdateMutation, {checkoutId, lineItems})
      .then(handleCheckoutMutation('checkoutLineItemsUpdate', this.graphQLClient));
  }
}

export default Client;
