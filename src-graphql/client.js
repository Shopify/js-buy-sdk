import GraphQLJSClient from '@shopify/graphql-js-client';
import types from '../types';

export default class Client {
  constructor(config, GraphQLClientClass = GraphQLJSClient) {
    const apiUrl = `https://${config.domain}/api/graphql`;
    const authHeader = `Authorization: Basic ${btoa(config.storefrontAccessToken)}`;

    this.graphQLClient = new GraphQLClientClass(types, apiUrl, {headers: authHeader});

  }
}
