import Resource from './resource';
import defaultResolver from './default-resolver';
import {paginateProductConnectionsAndResolve} from './paginators';
import productHelpers from './product-helpers';

// GraphQL
import productNodeQuery from './graphql/productNodeQuery.graphql';
import productNodesQuery from './graphql/productNodesQuery.graphql';
import productConnectionQuery from './graphql/productConnectionQuery.graphql';
import productByHandleQuery from './graphql/productByHandleQuery.graphql';

/**
 * The JS Buy SDK product resource
 * @class
 */
class ProductResource extends Resource {
  get helpers() {
    return productHelpers;
  }

  /**
   * Fetches all products on the shop.
   *
   * @example
   * client.product.fetchAll().then((products) => {
   *   // Do something with the products
   * });
   *
   * @param {Int} [pageSize] The number of products to fetch per page
   * @return {Promise|GraphModel[]} A promise resolving with an array of `GraphModel`s of the products.
   */
  fetchAll(first = 20) {
    return this.graphQLClient
      .send(productConnectionQuery, {first})
      .then(defaultResolver('products'))
      .then(paginateProductConnectionsAndResolve(this.graphQLClient));
  }

  /**
   * Fetches a single product by ID on the shop.
   *
   * @example
   * client.product.fetch('Xk9lM2JkNzFmNzIQ4NTIY4ZDFi9DaGVja291dC9lM2JkN==').then((product) => {
   *   // Do something with the product
   * });
   *
   * @param {String} id The id of the product to fetch.
   * @return {Promise|GraphModel} A promise resolving with a `GraphModel` of the product.
   */
  fetch(id) {
    return this.graphQLClient
      .send(productNodeQuery, {id})
      .then(defaultResolver('node'))
      .then(paginateProductConnectionsAndResolve(this.graphQLClient));
  }

  /**
   * Fetches multiple products by ID on the shop.
   *
   * @example
   * const ids = ['Xk9lM2JkNzFmNzIQ4NTIY4ZDFi9DaGVja291dC9lM2JkN==', 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0Lzc4NTc5ODkzODQ='];
   * client.product.fetchMultiple(ids).then((products) => {
   *   // Do something with the products
   * });
   *
   * @param {String[]} ids The ids of the products to fetch
   * @return {Promise|GraphModel[]} A promise resolving with a `GraphModel` of the product.
   */
  fetchMultiple(ids) {
    return this.graphQLClient
      .send(productNodesQuery, {ids})
      .then(defaultResolver('nodes'))
      .then(paginateProductConnectionsAndResolve(this.graphQLClient));
  }

  /**
   * Fetches a single product by handle on the shop.
   *
   * @example
   * client.product.fetchByHandle('my-product').then((product) => {
   *   // Do something with the product
   * });
   *
   * @param {String} handle The handle of the product to fetch.
   * @return {Promise|GraphModel} A promise resolving with a `GraphModel` of the product.
   */
  fetchByHandle(handle) {
    return this.graphQLClient
      .send(productByHandleQuery, {handle})
      .then(defaultResolver('productByHandle'))
      .then(paginateProductConnectionsAndResolve(this.graphQLClient));
  }

  /**
   * Fetches all products on the shop that match the query.
   *
   * @example
   * client.product.fetchQuery({first: 20, sortKey: 'CREATED_AT', reverse: true}).then((products) => {
   *   // Do something with the first 10 products sorted by title in ascending order
   * });
   *
   * @param {Object} [args] An object specifying the query data containing zero or more of:
   *   @param {Int} [args.first=20] The relay `first` param. This specifies page size.
   *   @param {String} [args.sortKey=ID] The key to sort results by. Available values are
   *   documented as {@link https://help.shopify.com/api/storefront-api/reference/enum/productsortkeys|Product Sort Keys}.
   *   @param {String} [args.query] A query string. See full documentation {@link https://help.shopify.com/api/storefront-api/reference/object/shop#products|here}
   *   @param {Boolean} [args.reverse] Whether or not to reverse the sort order of the results
   * @return {Promise|GraphModel[]} A promise resolving with an array of `GraphModel`s of the products.
   */
  fetchQuery({first = 20, sortKey = 'ID', query, reverse} = {}) {
    return this.graphQLClient
      .send(productConnectionQuery, {
        first,
        sortKey,
        query,
        reverse
      })
      .then(defaultResolver('products'))
      .then(paginateProductConnectionsAndResolve(this.graphQLClient));
  }
}

export default ProductResource;
