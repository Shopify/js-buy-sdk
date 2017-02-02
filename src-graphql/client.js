import GraphQLJSClient from '@shopify/graphql-js-client';
import types from '../types';
import base64Encode from './base64encode';
import './isomorphic-fetch';
import productQuery from './product-query';
import collectionQuery from './collection-query';

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

  fetchAllProducts(query = productQuery({client: this.graphQLClient})) {
    return this.graphQLClient.send(query).then((response) => {
      return response.model.shop.products;
    });
  }

  fetchProduct(query) {
    return this.graphQLClient.send(query).then((response) => {
      return response.model.product;
    });
  }

  fetchAllCollections(query = collectionQuery({client: this.graphQLClient})) {
    return this.graphQLClient.send(query).then((response) => {
      return response.model.shop.collections;
    });
  }

  fetchCollection(query) {
    return this.graphQLClient.send(query).then((response) => {
      return response.model.collection;
    });
  }
}
