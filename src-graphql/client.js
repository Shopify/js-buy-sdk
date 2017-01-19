import GraphQLJSClient from '@shopify/graphql-js-client';
import types from '../types';
import base64Encode from './base64encode';
import './isomorphic-fetch';

export default class Client {
  constructor(config, GraphQLClientClass = GraphQLJSClient) {
    const apiUrl = `https://${config.domain}/api/graphql`;
    const authHeader = `Basic ${base64Encode(config.storefrontAccessToken)}`;

    this.graphQLClient = new GraphQLClientClass(types, {
      url: apiUrl,
      fetcherOptions: {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: authHeader
        }
      }
    });
  }

  fetchAllProducts() {
    const query = this.graphQLClient.query((root) => {
      root.add('shop', (shop) => {
        shop.addConnection('products', {args: {first: 10}}, (products) => {
          addProductFields(products);
        });
      });
    });

    return this.graphQLClient.send(query).then((response) => {
      return response.model.shop.products;
    });
  }

  fetchProduct(id) {
    const query = this.graphQLClient.query((root) => {
      root.add('product', {args: {id: createGid('Product', id)}}, (product) => {
        addProductFields(product);
      });
    });

    return this.graphQLClient.send(query).then((response) => {
      return response.model.product;
    });
  }
}

function createGid(type, id) {
  return `gid://shopify/${type}/${id}`;
}

function addProductFields(product) {
  product.add('id');
  product.add('createdAt');
  product.add('updatedAt');
  product.add('bodyHtml');
  product.add('handle');
  product.add('productType');
  product.add('title');
  product.add('vendor');
  product.add('tags');
  product.add('publishedAt');
  product.addConnection('images', {args: {first: 10}}, (images) => {
    images.add('id');
    images.add('src');
    images.add('altText');
  });
  product.add('options', (options) => {
    options.add('id');
    options.add('name');
    options.add('values');
  });
  product.addConnection('variants', {args: {first: 10}}, (variants) => {
    variants.add('id');
    variants.add('title');
    variants.add('selectedOptions', (selectedOptions) => {
      selectedOptions.add('name');
      selectedOptions.add('value');
    });
    variants.add('price');
    variants.add('weight');
  });
}
