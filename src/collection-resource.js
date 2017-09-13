import Resource from './resource';
import defaultResolver from './default-resolver';
import {paginateCollectionsProductConnectionsAndResolve} from './paginators';

// GraphQL
import collectionNodeQuery from './graphql/collectionNodeQuery.graphql';
import collectionNodeWithProductsQuery from './graphql/collectionNodeWithProductsQuery.graphql';
import collectionConnectionQuery from './graphql/collectionConnectionQuery.graphql';
import collectionConnectionWithProductsQuery from './graphql/collectionConnectionWithProductsQuery.graphql';
import collectionByHandleQuery from './graphql/collectionByHandleQuery.graphql';

export default class CollectionResource extends Resource {

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
  fetchAll() {
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
  fetchAllWithProducts({first = 20, productsFirst = 20} = {}) {
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
  fetch(id) {
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
  fetchWithProducts(id, productsFirst = 20) {
    return this.graphQLClient
      .send(collectionNodeWithProductsQuery, {id, productsFirst})
      .then(defaultResolver('node'))
      .then(paginateCollectionsProductConnectionsAndResolve(this.graphQLClient));
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
  fetchByHandle(handle) {
    return this.graphQLClient
      .send(collectionByHandleQuery, {handle})
      .then(defaultResolver('shop.collectionByHandle'));
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
  fetchQuery({first = 20, sortKey = 'ID', query, reverse}) {
    return this.graphQLClient.send(collectionConnectionQuery, {
      first,
      sortKey: this.graphQLClient.enum(sortKey),
      query,
      reverse
    }).then(defaultResolver('shop.collections'));
  }
}
