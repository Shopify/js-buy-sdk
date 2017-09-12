import Resource from './resource';
import defaultResolver from './default-resolver';
import {paginateProductConnectionsAndResolve} from './paginators';
import productHelpers from './product-helpers';

// GraphQL
import productNodeQuery from './graphql/productNodeQuery.graphql';
import productConnectionQuery from './graphql/productConnectionQuery.graphql';
import productByHandleQuery from './graphql/productByHandleQuery.graphql';

export default class ProductResource extends Resource {
  get helpers() {
    return productHelpers;
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
  fetchAll(pageSize = 20) {
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
  fetch(id) {
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
  fetchByHandle(handle) {
    return this.graphQLClient
      .send(productByHandleQuery, {handle})
      .then(defaultResolver('shop.productByHandle'))
      .then(paginateProductConnectionsAndResolve(this.graphQLClient));
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
  fetchQuery({first = 20, sortKey = 'ID', query, reverse}) {
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

}
