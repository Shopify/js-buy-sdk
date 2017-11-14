export default function handleCustomerMutation(mutationRootKey, client) {
  return function({data, model}) {
    console.log(data);
    const rootData = data[mutationRootKey];
    const rootModel = model[mutationRootKey];
    const userErrors = rootData.userErrors;

    if (userErrors.length) {
      return Promise.reject(new Error(JSON.stringify(userErrors)));
    }

    return Promise.resolve(rootData);

    /**
     return client.fetchAllPages(rootModel.checkout.lineItems, {pageSize: 250}).then((lineItems) => {
      rootModel.checkout.attrs.lineItems = lineItems;

      return rootModel.checkout;
    });
     **/
  };
}