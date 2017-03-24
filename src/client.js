import GraphQLJSClient from '@shopify/graphql-js-client';
import types from '../types';
import base64Encode from './base64encode';
import './isomorphic-fetch';
import productQuery from './product-query';
import productConnectionQuery from './product-connection-query';
import collectionQuery from './collection-query';
import collectionConnectionQuery from './collection-connection-query';
import ProductHelpers from './product-helpers';
import checkoutQuery from './checkout-query';

/**
 * @class Client
 */
export default class Client {
  constructor(config, GraphQLClientClass = GraphQLJSClient) {
    const apiUrl = `https://${config.domain}/api/graphql`;
    const authHeader = `Basic ${base64Encode(config.storefrontAccessToken)}`;

    this.graphQLClient = new GraphQLClientClass(types, {
      url: apiUrl,
      fetcherOptions: {
        headers: {
          Authorization: authHeader
        }
      }
    });

    this.Product = {};
    this.Product.Helpers = new ProductHelpers();
  }

  fetchAllProducts(query = productConnectionQuery()) {
    const rootQuery = this.graphQLClient.query((root) => {
      root.add('shop', (shop) => {
        query(shop, 'products');
      });
    });

    return this.graphQLClient.send(rootQuery).then(({model}) => {
      const promises = model.shop.products.reduce((promiseAcc, product) => {
        // Fetch the rest of the images and variants for this product
        promiseAcc.push(this.graphQLClient.fetchAllPages(product.images, {pageSize: 250}).then((images) => {
          product.attrs.images = images;
        }));

        promiseAcc.push(this.graphQLClient.fetchAllPages(product.variants, {pageSize: 250}).then((variants) => {
          product.attrs.variants = variants;
        }));

        return promiseAcc;
      }, []);

      return Promise.all(promises).then(() => {
        return model.shop.products;
      });
    });
  }

  fetchProduct(id, query = productQuery()) {
    const rootQuery = this.graphQLClient.query((root) => {
      query(root, 'node', id);
    });

    return this.graphQLClient.send(rootQuery).then(({model}) => {
      const promises = [];

      promises.push(this.graphQLClient.fetchAllPages(model.node.images, {pageSize: 250}).then((images) => {
        model.node.attrs.images = images;
      }));

      promises.push(this.graphQLClient.fetchAllPages(model.node.variants, {pageSize: 250}).then((variants) => {
        model.node.attrs.variants = variants;
      }));

      return Promise.all(promises).then(() => {
        return model.node;
      });
    });
  }

  fetchAllCollections(query = collectionConnectionQuery()) {
    const rootQuery = this.graphQLClient.query((root) => {
      root.add('shop', (shop) => {
        query(shop, 'collections');
      });
    });

    return this.graphQLClient.send(rootQuery).then((response) => {
      return response.model.shop.collections;
    });
  }

  fetchCollection(id, query = collectionQuery()) {
    const rootQuery = this.graphQLClient.query((root) => {
      query(root, 'node', id);
    });

    return this.graphQLClient.send(rootQuery).then((response) => {
      return response.model.node;
    });
  }

/**
 * Creates a checkout.
 *
 * ```javascript
 * client.createCheckout({lineItems:[ ... ]}).then(checkout => {
 *   // do something with the checkout
 * });
 * ```
 *
 * @method createCheckout
 * @public
 * @param {Object} [input] An input object containing zero or more of:
 *   @param {String} [input.email] An email connected to the checkout
 *   @param {Array} [input.lineItems] A list of line items in the checkout
 *   @param {Object} [input.shippingAddress] A shipping address
 *   @param {String} [input.note] A note for the checkout
 *   @param {Array} [input.customAttributes] A list of custom attributes
 * @param {Function} [query] Callback function to specify fields to query on the checkout returned
 * @return {Promise|GraphModel} A promise resolving with the created checkout.
 */
  createCheckout(input = {}, query = checkoutQuery()) {
    const mutation = this.graphQLClient.mutation((root) => {
      root.add('checkoutCreate', {args: {input}}, (checkoutCreate) => {
        checkoutCreate.add('userErrors', (userErrors) => {
          userErrors.add('message');
          userErrors.add('field');
        });
        query(checkoutCreate, 'checkout');
      });
    });

    return this.graphQLClient.send(mutation).then((result) => {
      return this.graphQLClient.fetchAllPages(result.model.checkoutCreate.checkout.lineItems, {pageSize: 250}).then((lineItems) => {
        result.model.checkoutCreate.checkout.attrs.lineItems = lineItems;

        return result.model.checkoutCreate.checkout;
      });
    });
  }


  /**
 * Adds line items to an existing checkout.
 *
 * ```javascript
 * client.addLineItems({checkoutId: ..., lineItems:[ ... ]}).then(checkout => {
 *   // do something with the updated checkout
 * });
 * ```
 *
 * @method addLineItems
 * @public
 * @param {Object} input An input object containing:
 *   @param {String} input.checkoutId The ID of the checkout to add line items to
 *   @param {Array} [input.lineItems] A list of line items to add to the checkout
 * @param {Function} [query] Callback function to specify fields to query on the checkout returned
 * @return {Promise|GraphModel} A promise resolving with the created checkout.
 */
  addLineItems(input, query = checkoutQuery()) {
    const mutation = this.graphQLClient.mutation((root) => {
      root.add('checkoutAddLineItems', {args: {input}}, (checkoutAddLineItems) => {
        checkoutAddLineItems.add('userErrors', (userErrors) => {
          userErrors.add('message');
          userErrors.add('field');
        });
        query(checkoutAddLineItems, 'checkout');
      });
    });

    return this.graphQLClient.send(mutation).then((result) => {
      return this.graphQLClient.fetchAllPages(result.model.checkoutAddLineItems.checkout.lineItems, {pageSize: 250}).then((lineItems) => {
        result.model.checkoutAddLineItems.checkout.attrs.lineItems = lineItems;

        return result.model.checkoutAddLineItems.checkout;
      });
    });
  }
}
