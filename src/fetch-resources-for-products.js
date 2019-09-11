export default function fetchResourcesForProducts(productOrProduct, client) {
  const products = [].concat(productOrProduct);

  return Promise.all(products.reduce((promiseAcc, product) => {

    // If the graphql query doesn't find a match, returns null.
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

    return promiseAcc;
  }, []));
}
