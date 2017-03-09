import GraphQLJSClient from '@shopify/graphql-js-client';
import types from '../types';
import base64Encode from './base64encode';
import './isomorphic-fetch';
import productQuery from './product-query';
import productConnectionQuery from './product-connection-query';
import collectionQuery from './collection-query';
import collectionConnectionQuery from './collection-connection-query';

function fetchAllPages(paginatedModels, client) {
  return client.fetchNextPage(paginatedModels).then(({model}) => {
    paginatedModels.push(...model);

    if (!model[model.length - 1].hasNextPage.valueOf()) {
      return paginatedModels;
    }

    return fetchAllPages(paginatedModels, client);
  });
}

function fetchAllProductResources(product, client) {
  const promises = [];
  const images = product.images;
  const variants = product.variants;

  if (images && images[images.length - 1].hasNextPage.valueOf()) {
    promises.push(fetchAllPages(product.images, client));
  }

  if (variants && variants[variants.length - 1].hasNextPage.valueOf()) {
    promises.push(fetchAllPages(product.variants, client));
  }

  return promises;
}

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
    return this.graphQLClient.send(query(this.graphQLClient)).then(({model}) => {
      const promises = model.shop.products.reduce((promiseAcc, product) => {
        // Fetch the rest of the images and variants for this product
        return promiseAcc.concat(fetchAllProductResources(product, this.graphQLClient));
      }, []);

      return Promise.all(promises).then(() => {
        return model.shop.products;
      });
    });
  }

  fetchProduct(id, query = productQuery()) {
    return this.graphQLClient.send(query(this.graphQLClient, id)).then(({model}) => {
      // Fetch the rest of the images and variants for this product
      const promises = fetchAllProductResources(model.node, this.graphQLClient);

      return Promise.all(promises).then(() => {
        return model.node;
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
