import GraphQLJSClient from './graphql-client';
import Config from './config';
import ProductResource from './product-resource';
import CollectionResource from './collection-resource';
import ShopResource from './shop-resource';
import CheckoutResource from './checkout-resource';
import CustomerResource from './customer-resource';
import ImageResource from './image-resource';
import {version} from '../package.json';

// GraphQL
import types from '../schema.json';

/**
 * The JS Buy SDK Client.
 * @class
 *
 * @property {ProductResource} product The property under which product fetching methods live.
 * @property {CollectionResource} collection The property under which collection fetching methods live.
 * @property {ShopResource} shop The property under which shop fetching methods live.
 * @property {CheckoutResource} checkout The property under which shop fetching and mutating methods live.
 * @property {ImageResource} image The property under which image helper methods live.
 */
class Client {

  /**
   * Primary entry point for building a new Client.
   */
  static buildClient(config, fetchFunction) {
    const newConfig = new Config(config);
    const client = new Client(newConfig, GraphQLJSClient, fetchFunction);

    client.config = newConfig;

    return client;
  }

  /**
   * @constructs Client
   * @param {Config} config An instance of {@link Config} used to configure the Client.
   */
  constructor(config, GraphQLClientClass = GraphQLJSClient, fetchFunction) {
    const url = `https://${config.domain}/api/${config.apiVersion}/graphql`;

    const headers = {
      'X-SDK-Variant': 'javascript',
      'X-SDK-Version': version,
      'X-Shopify-Storefront-Access-Token': config.storefrontAccessToken
    };

    if (config.source) {
      headers['X-SDK-Variant-Source'] = config.source;
    }

    const languageHeader = config.language ? config.language : '*';

    headers['Accept-Language'] = languageHeader;

    if (fetchFunction) {
      headers['Content-Type'] = 'application/json';
      headers.Accept = 'application/json';

      this.graphQLClient = new GraphQLClientClass(types, {
        fetcher: function fetcher(graphQLParams) {
          return fetchFunction(url, {
            body: JSON.stringify(graphQLParams),
            method: 'POST',
            mode: 'cors',
            headers
          }).then((response) => response.json());
        }
      });
    } else {
      this.graphQLClient = new GraphQLClientClass(types, {
        url,
        fetcherOptions: {headers}
      });
    }

    this.product = new ProductResource(this.graphQLClient);
    this.collection = new CollectionResource(this.graphQLClient);
    this.shop = new ShopResource(this.graphQLClient);
    this.checkout = new CheckoutResource(this.graphQLClient);
    this.customer = new CustomerResource(this.graphQLClient);
    this.image = new ImageResource(this.graphQLClient);
  }

  /**
   * Fetches the next page of models
   *
   * @example
   * client.fetchNextPage(products).then((nextProducts) => {
   *   // Do something with the products
   * });
   *
   * @param {models} [Array] The paginated set to fetch the next page of
   * @return {Promise|GraphModel[]} A promise resolving with an array of `GraphModel`s of the type provided.
   */
  fetchNextPage(models) {
    return this.graphQLClient.fetchNextPage(models);
  }
}

export default Client;
