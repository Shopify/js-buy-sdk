export default function handleCheckoutMutation(mutationRootKey, client) {
  return function({data, errors, model}) {
    const rootData = data[mutationRootKey];
    const rootModel = model[mutationRootKey];

    if (rootData && rootData.checkout) {
      return client.fetchAllPages(rootModel.checkout.lineItems, {pageSize: 250}).then((lineItems) => {
        rootModel.checkout.attrs.lineItems = lineItems;
        rootModel.checkout.errors = errors;
        rootModel.checkout.userErrors = rootModel.userErrors;

        return rootModel.checkout;
      });
    }

    if (errors && errors.length) {
      return Promise.reject(new Error(JSON.stringify(errors)));
    }

    if (rootData && rootData.checkoutUserErrors && rootData.checkoutUserErrors.length) {
      return Promise.reject(new Error(JSON.stringify(rootData.checkoutUserErrors)));
    }

    if (rootData && rootData.userErrors && rootData.userErrors.length) {
      return Promise.reject(new Error(JSON.stringify(rootData.userErrors)));
    }

    return Promise.reject(new Error(`The ${mutationRootKey} mutation failed due to an unknown error.`));
  };
}
