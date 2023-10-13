import fetchResourcesForProducts from './fetch-resources-for-products';

export function paginateProductConnectionsAndResolve(client) {
  return function(products) {
    return fetchResourcesForProducts(products, client).then(() => {
      return products;
    });
  };
}

export function paginateCollectionsProductConnectionsAndResolve(client) {
  return function(collectionOrCollections) {
    const collections = [].concat(collectionOrCollections);

    return Promise.all(collections.reduce((promiseAcc, collection) => {
      return promiseAcc.concat(fetchResourcesForProducts(collection.products, client));
    }, [])).then(() => {
      return collectionOrCollections;
    });
  };
}
