import GraphQLJSClient from '@shopify/graphql-js-client';
import types from '../types';
import base64Encode from './base64encode';
import './isomorphic-fetch';
import productQuery from './product-query';
import productConnectionQuery from './product-connection-query';
import collectionQuery from './collection-query';
import collectionConnectionQuery from './collection-connection-query';

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
  }

  fetchAllProducts(query = productConnectionQuery()) {
    return this.graphQLClient.send(query(this.graphQLClient)).then((response) => {
      return response.model.shop.products;
    });
  }

  fetchProduct(id, query = productQuery()) {
    return this.graphQLClient.send(query(this.graphQLClient, id)).then((response) => {
      return response.model.node;
    });
  }

  fetchAllCollections(query = collectionConnectionQuery()) {
    return this.graphQLClient.send(query(this.graphQLClient)).then((response) => {
      return response.model.shop.collections;
    });
  }

  fetchCollection(id, query = collectionQuery()) {
    return this.graphQLClient.send(query(this.graphQLClient, id)).then((response) => {
      return response.model.node;
    });
  }
}
