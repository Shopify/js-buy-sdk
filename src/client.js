import GraphQLJSClient from './graphql-client';
import Config from './config';
import ProductResource from './product-resource';
import CollectionResource from './collection-resource';
import ShopResource from './shop-resource';
import CheckoutResource from './checkout-resource';
import ImageResource from './image-resource';
import {version} from '../package.json';

// GraphQL
import types from '../schema.json';

/**
 * The JS Buy SDK Client.
 * @class
 *
 * @property {Object} product The property under which product fetching methods live.
 * @property {Object} collection The property under which collection fetching methods live.
 * @property {Object} shop The property under which shop fetching methods live.
 * @property {Object} checkout The property under which shop fetching and mutating methods live.
 * @property {Object} image The property under which image helper methods live.
 */
class Client {

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

    this.product = new ProductResource(this.graphQLClient);
    this.collection = new CollectionResource(this.graphQLClient);
    this.shop = new ShopResource(this.graphQLClient);
    this.checkout = new CheckoutResource(this.graphQLClient);
    this.image = new ImageResource(this.graphQLClient);
  }
}

export default Client;
