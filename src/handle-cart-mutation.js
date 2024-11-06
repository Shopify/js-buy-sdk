import PayloadMapper from './payload-map-resource';

export default function handleCartMutation(mutationRootKey, client) {
  const payloadMapper = new PayloadMapper(client);

  return function({data = {}, errors, model = {}}) {
    const rootData = data[mutationRootKey];
    const rootModel = model[mutationRootKey];

    if (rootData && rootData.cart) {
      return client.fetchAllPages(rootModel.cart.lines, {pageSize: 250}).then((lines) => {
        rootModel.cart.attrs.lines = lines;
        rootModel.cart.errors = errors;

        const checkout = payloadMapper.checkout(rootModel.cart);

        return checkout;
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
