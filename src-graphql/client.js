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

  fetchAllProducts(queryFields = productQuery()) {
    const query = this.graphQLClient.query((root) => {
      root.add('shop', (shop) => {
        shop.addConnection('products', {args: {first: 20}}, (products) => {
          addProductFields(products, queryFields);
        });
      });
    });

    return this.graphQLClient.send(query).then((response) => {
      return response.model.shop.products;
    });
  }

  fetchProduct(id, queryFields = productQuery()) {
    const query = this.graphQLClient.query((root) => {
      root.add('product', {args: {id: createGid('Product', id)}}, (product) => {
        addProductFields(product, queryFields);
      });
    });

    return this.graphQLClient.send(query).then((response) => {
      return response.model.product;
    });
  }

  fetchAllCollections(queryFields = collectionQuery()) {
    const query = this.graphQLClient.query((root) => {
      root.add('shop', (shop) => {
        shop.addConnection('collections', {args: {first: 20}}, (collections) => {
          addCollectionFields(collections, queryFields);
        });
      });
    });

    return this.graphQLClient.send(query).then((response) => {
      return response.model.shop.collections;
    });
  }

  fetchCollection(id, queryFields = collectionQuery()) {
    const query = this.graphQLClient.query((root) => {
      root.add('collection', {args: {id: createGid('Collection', id)}}, (collection) => {
        addCollectionFields(collection, queryFields);
      });
    });

    return this.graphQLClient.send(query).then((response) => {
      return response.model.collection;
    });
  }
}

function createGid(type, id) {
  return `gid://shopify/${type}/${id}`;
}

function addScalars(object, scalars) {
  scalars.forEach((scalar) => {
    object.add(scalar);
  });
}

function addProductFields(product, queryFields) {
  addScalars(product, queryFields.scalars);
  if (queryFields.images) {
    product.addConnection('images', {args: {first: 20}}, (images) => {
      addScalars(images, queryFields.images.scalars);
    });
  }
  if (queryFields.options) {
    product.add('options', (options) => {
      addScalars(options, queryFields.options.scalars);
    });
  }
  if (queryFields.variants) {
    product.addConnection('variants', (variants) => {
      addScalars(variants, queryFields.variants.scalars);
      if (queryFields.variants.selectedOptions) {
        variants.add('selectedOptions', (selectedOptions) => {
          addScalars(selectedOptions, queryFields.variants.selectedOptions.scalars);
        });
      }
    });
  }
}

function addCollectionFields(collection, queryFields) {
  addScalars(collection, queryFields.scalars);
  if (queryFields.image) {
    collection.add('image', (image) => {
      addScalars(image, queryFields.image.scalars);
    });
  }
}
