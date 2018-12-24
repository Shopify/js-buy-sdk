import Resource from './resource';
import defaultResolver from './default-resolver';
import {paginateCollectionsProductConnectionsAndResolve} from './paginators';

// GraphQL
import collectionNodeQuery from './graphql/collectionNodeQuery.graphql';
import collectionNodeWithProductsQuery from './graphql/collectionNodeWithProductsQuery.graphql';
import collectionConnectionQuery from './graphql/collectionConnectionQuery.graphql';
import collectionConnectionWithProductsQuery from './graphql/collectionConnectionWithProductsQuery.graphql';
import collectionByHandleQuery from './graphql/collectionByHandleQuery.graphql';

/**
 * The JS Buy SDK collection resource
 * @class
 */
class CollectionResource extends Resource {

  /**
   * Fetches all collections on the shop, not including products.
   * To fetch collections with products use [fetchAllsWithProducts]{@link Client#fetchAllsWithProducts}.
   *
   * @example
   * client.collection.fetchAll().then((collections) => {
   *   // Do something with the collections
   * });
   *
   * @return {Promise|GraphModel[]} A promise resolving with an array of `GraphModel`s of the collections.
   */
  fetchAll(first = 20) {
    return this.graphQLClient
      .send(collectionConnectionQuery, {first})
      .then(defaultResolver('collections'));
  }

  /**
   * Fetches all collections on the shop, including products.
   *
   * @example
   * client.collection.fetchAllWithProducts().then((collections) => {
   *   // Do something with the collections
   * });
   *
   * @return {Promise|GraphModel[]} A promise resolving with an array of `GraphModel`s of the collections.
   */
  fetchAllWithProducts({first = 20, productsFirst = 20} = {}) {
    return this.graphQLClient
      .send(collectionConnectionWithProductsQuery, {first, productsFirst})
      .then(defaultResolver('collections'))
      .then(paginateCollectionsProductConnectionsAndResolve(this.graphQLClient));
  }

  /**
   * Fetches a single collection by ID on the shop, not including products.
   * To fetch the collection with products use [fetchWithProducts]{@link Client#fetchWithProducts}.
   *
   * @example
   * client.collection.fetch('Xk9lM2JkNzFmNzIQ4NTIY4ZDFiZTUyZTUwNTE2MDNhZjg==').then((collection) => {
   *   // Do something with the collection
   * });
   *
   * @param {String} id The id of the collection to fetch.
   * @return {Promise|GraphModel} A promise resolving with a `GraphModel` of the collection.
   */
  fetch(id) {
    return this.graphQLClient
      .send(collectionNodeQuery, {id})
      .then(defaultResolver('node'));
  }

  /**
   * Fetches a single collection by ID on the shop, including products.
   *
   * @example
   * client.collection.fetchWithProducts('Xk9lM2JkNzFmNzIQ4NTIY4ZDFiZTUyZTUwNTE2MDNhZjg==').then((collection) => {
   *   // Do something with the collection
   * });
   *
   * @param {String} id The id of the collection to fetch.
   * @return {Promise|GraphModel} A promise resolving with a `GraphModel` of the collection.
   */
  fetchWithProducts(id) {
    return this.graphQLClient
      .send(collectionNodeWithProductsQuery, {id})
      .then(defaultResolver('node'))
      .then(paginateCollectionsProductConnectionsAndResolve(this.graphQLClient));
  }

  /**
   * Fetches a collection by handle on the shop.
   *
   * @example
   * client.collection.fetchByHandle('my-collection').then((collection) => {
   *   // Do something with the collection
   * });
   *
   * @param {String} handle The handle of the collection to fetch.
   * @return {Promise|GraphModel} A promise resolving with a `GraphModel` of the collection.
   */
  fetchByHandle(handle) {
    return this.graphQLClient
      .send(collectionByHandleQuery, {handle})
      .then(defaultResolver('collectionByHandle'));
  }

  /**
   * Fetches all collections on the shop that match the query.
   *
   * @example
   * client.collection.fetchQuery({first: 20, sortKey: 'CREATED_AT', reverse: true}).then((collections) => {
   *   // Do something with the first 10 collections sorted by title in ascending order
   * });
   *
   * @param {Object} [args] An object specifying the query data containing zero or more of:
   *   @param {Int} [args.first=20] The relay `first` param. This specifies page size.
   *   @param {String} [args.sortKey=ID] The key to sort results by. Available values are
   *   documented as {@link https://help.shopify.com/api/storefront-api/reference/enum/collectionsortkeys|Collection Sort Keys}.
   *   @param {String} [args.query] A query string. See full documentation {@link https://help.shopify.com/api/storefront-api/reference/object/shop#collections|here}
   *   @param {Boolean} [args.reverse] Whether or not to reverse the sort order of the results
   * @return {Promise|GraphModel[]} A promise resolving with an array of `GraphModel`s of the collections.
   */
  fetchQuery({first = 20, sortKey = 'ID', query, reverse} = {}) {
    return this.graphQLClient.send(collectionConnectionQuery, {
      first,
      sortKey,
      query,
      reverse
    }).then(defaultResolver('collections'));
  }
}
export default CollectionResource;
