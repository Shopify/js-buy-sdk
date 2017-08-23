export default function handleCheckoutMutation(mutationRootKey, client) {
  return function({data, model}) {
    const rootData = data[mutationRootKey];
    const rootModel = model[mutationRootKey];
    const userErrors = rootData.userErrors;

    if (userErrors.length) {
      return Promise.reject(new Error(JSON.stringify(userErrors)));
    }

    return client.fetchAllPages(rootModel.checkout.lineItems, {pageSize: 250}).then((lineItems) => {
      rootModel.checkout.attrs.lineItems = lineItems;

      return rootModel.checkout;
    });
  };
}
