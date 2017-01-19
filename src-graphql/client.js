import GraphQLJSClient from '@shopify/graphql-js-client';
import types from '../types';
import base64 from './base64';

export default class Client {
  constructor(config, GraphQLClientClass = GraphQLJSClient) {
    const apiUrl = `https://${config.domain}/api/graphql`;
    const authHeader = `Authorization: Basic ${base64(config.storefrontAccessToken)}`;

    this.graphQLClient = new GraphQLClientClass(types, apiUrl, {headers: authHeader});
  }
}
