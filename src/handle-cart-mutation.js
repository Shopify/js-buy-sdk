export default function handleCartMutation(mutationRootKey, client) {
  return function({data = {}, errors, model = {}}) {
    const rootData = data[mutationRootKey];
    const rootModel = model[mutationRootKey];

    if (rootData && rootData.cart) {
      return client.fetchAllPages(rootModel.cart.lineItems, {pageSize: 250}).then((lineItems) => {
        rootModel.cart.attrs.lineItems = lineItems;
        rootModel.cart.errors = errors;

        return rootModel.cart;
      });
    }

    if (errors && errors.length) {
      return Promise.reject(new Error(JSON.stringify(errors)));
    }

    if (rootData && rootData.userErrors && rootData.userErrors.length) {
      return Promise.reject(new Error(JSON.stringify(rootData.userErrors)));
    }

    return Promise.reject(new Error(`The ${mutationRootKey} mutation failed due to an unknown error.`));
  };
}
