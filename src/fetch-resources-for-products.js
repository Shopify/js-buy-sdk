export default function fetchResourcesForProducts(productOrProduct, client) {
  const products = [].concat(productOrProduct);

  return Promise.all(products.reduce((promiseAcc, product) => {

    // If the graphql query doesn't find a match, skip fetching variants and images.
    if (product === null) {
      return promiseAcc;
    }

    // Fetch the rest of the images and variants for this product
    promiseAcc.push(client.fetchAllPages(product.images, {pageSize: 250}).then((images) => {
      product.attrs.images = images;
    }));

    promiseAcc.push(client.fetchAllPages(product.variants, {pageSize: 250}).then((variants) => {
      product.attrs.variants = variants;
    }));

    // This may appear as an array of null values, so we must remove them before fetching their child nodes.
    const metafieldsWithReferenceList = (product.metafieldsWithReferenceList || []).filter((metafield) => Boolean(metafield));

    promiseAcc.push(client.fetchAllPages(metafieldsWithReferenceList, {pageSize: 20}).then((_metafieldsWithReferenceList) => {
      product.attrs.metafieldsWithReferenceList = _metafieldsWithReferenceList;
    }));

    return promiseAcc;
  }, []));
}
