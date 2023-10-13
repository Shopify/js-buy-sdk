import fetchResourcesForProducts from './fetch-resources-for-products';

export function paginateProductConnectionsAndResolve(client) {
  return function(products) {
    return fetchResourcesForProducts(products, client).then(() => {
      return products;
    });
  };
}

export function paginateCollectionsProductConnectionsAndResolve(client, {numVariants = 250, numImages = 250} = {}) {
  return function(collectionOrCollections) {
    const collections = [].concat(collectionOrCollections);

    return Promise.all(collections.reduce((promiseAcc, collection) => {
      return promiseAcc.concat(fetchResourcesForProducts(collection.products, client, {numImages, numVariants}));
    }, [])).then(() => {
      return collectionOrCollections;
    });
  };
}
