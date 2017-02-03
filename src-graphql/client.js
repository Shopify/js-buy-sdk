import GraphQLJSClient from '@shopify/graphql-js-client';
import types from '../types';
import base64Encode from './base64encode';
import './isomorphic-fetch';
import productQuery from './product-query';
import productConnectionQuery from './product-connection-query';
import collectionQuery from './collection-query';
import collectionConnectionQuery from './collection-connection-query';
import fetchAll from './fetch-all';

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

  fetchAllImagesOrVariants(type, product, allImagesOrVariants, promises) {
    if (product[type].pageInfo.hasNextPage) {
      promises.push(this.graphQLClient.send(allImagesOrVariants.nextPageQuery()).then((result) => {
        allImagesOrVariants.push(...result.model.node[type]);

        return fetchAll(type, allImagesOrVariants, result, this.graphQLClient);
      }));
    }
  }

  fetchAllProducts(query = productConnectionQuery()) {
    return this.graphQLClient.send(query(this.graphQLClient)).then((response) => {
      const promises = [];

      // Add all images and variants for each product
      for (let i = 0; i < response.model.shop.products.length; i++) {
        const productImages = response.model.shop.products[i].images;
        const productVariants = response.model.shop.products[i].variants;

        // Fetch the rest of the images for this product
        this.fetchAllImagesOrVariants('images', response.data.shop.products.edges[i].node, productImages, promises);

        // Fetch the rest of the variants for this product
        this.fetchAllImagesOrVariants('variants', response.data.shop.products.edges[i].node, productVariants, promises);
      }

      return Promise.all(promises).then(() => {
        return response.model.shop.products;
      });
    });
  }

  fetchProduct(id, query = productQuery()) {
    return this.graphQLClient.send(query(this.graphQLClient, id)).then((response) => {
      const promises = [];
      const productImages = response.model.node.images;
      const productVariants = response.model.node.variants;

      // Fetch the rest of the images for this product
      this.fetchAllImagesOrVariants('images', response.data.node, productImages, promises);

      // Fetch the rest of the variants for this product
      this.fetchAllImagesOrVariants('variants', response.data.node, productVariants, promises);

      return Promise.all(promises).then(() => {
        return response.model.node;
      });
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
