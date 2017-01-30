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
          Authorization: authHeader
        }
      }
    });
  }

  fetchAllProducts(productQuery) {
    const query = this.graphQLClient.query((root) => {
      root.add('shop', (shop) => {
        shop.addConnection('products', {args: {first: 20}}, (products) => {
          addProductFields(products, productQuery);
        });
      });
    });

    return this.graphQLClient.send(query).then((response) => {
      return response.model.shop.products;
    });
  }

  fetchProduct(id, productQuery) {
    const query = this.graphQLClient.query((root) => {
      root.add('product', {args: {id: createGid('Product', id)}}, (product) => {
        addProductFields(product, productQuery);
      });
    });

    return this.graphQLClient.send(query).then((response) => {
      return response.model.product;
    });
  }

  fetchAllCollections(collectionQuery) {
    const query = this.graphQLClient.query((root) => {
      root.add('shop', (shop) => {
        shop.addConnection('collections', {args: {first: 20}}, (collections) => {
          addCollectionFields(collections, collectionQuery);
        });
      });
    });

    return this.graphQLClient.send(query).then((response) => {
      return response.model.shop.collections;
    });
  }

  fetchCollection(id, collectionQuery) {
    const query = this.graphQLClient.query((root) => {
      root.add('collection', {args: {id: createGid('Collection', id)}}, (collection) => {
        addCollectionFields(collection, collectionQuery);
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

function addProductFields(product, productQuery) {
  addScalars(product, productQuery.scalars);
  if (productQuery.images) {
    product.addConnection('images', {args: {first: 20}}, (images) => {
      addScalars(images, productQuery.images.scalars);
    });
  }
  if (productQuery.options) {
    product.add('options', (options) => {
      addScalars(options, productQuery.options.scalars);
    });
  }
  if (productQuery.variants) {
    product.addConnection('variants', (variants) => {
      addScalars(variants, productQuery.variants.scalars);
      if (productQuery.variants.selectedOptions) {
        variants.add('selectedOptions', (selectedOptions) => {
          addScalars(selectedOptions, productQuery.variants.selectedOptions.scalars);
        });
      }
    });
  }
}

function addCollectionFields(collection, collectionQuery) {
  addScalars(collection, collectionQuery.scalars);
  if (collectionQuery.image) {
    collection.add('image', (image) => {
      addScalars(image, collectionQuery.image.scalars);
    });
  }
}
