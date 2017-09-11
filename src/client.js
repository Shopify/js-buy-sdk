import GraphQLJSClient from './graphql-client';
import Config from './config';
import handleCheckoutMutation from './handle-checkout-mutation';
import productHelpers from './product-helpers';
import imageHelpers from './image-helpers';
import defaultResolver from './default-resolver';
import ProductResource from './product-resource';
import CollectionResource from './collection-resource';
import ShopResource from './shop-resource';
import {version} from '../package.json';

// GraphQL
import types from '../schema.json';
import checkoutNodeQuery from './graphql/checkoutNodeQuery.graphql';
import checkoutCreateMutation from './graphql/checkoutCreateMutation.graphql';
import checkoutLineItemsAddMutation from './graphql/checkoutLineItemsAddMutation.graphql';
import checkoutLineItemsRemoveMutation from './graphql/checkoutLineItemsRemoveMutation.graphql';
import checkoutLineItemsUpdateMutation from './graphql/checkoutLineItemsUpdateMutation.graphql';

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

    this.product = new ProductResource(this.graphQLClient, productHelpers);
    this.collection = new CollectionResource(this.graphQLClient);
    this.shop = new ShopResource(this.graphQLClient);
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
