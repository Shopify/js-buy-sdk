import {mapCartPayload} from './cart-payload-mapper';
import checkoutUserErrorsMapper from './checkout-map-user-error-codes';

export default function handleCartMutation(mutationRootKey, client) {
  return function({data = {}, errors, model = {}}) {
    const rootData = data[mutationRootKey];
    const rootModel = model[mutationRootKey];

    if (rootData && rootData.cart) {
      return client.fetchAllPages(rootModel.cart.lines, {pageSize: 250}).then((lines) => {
        rootModel.cart.attrs.lines = lines;
        rootModel.cart.errors = errors;
        rootModel.cart.userErrors = rootData.userErrors;

        return mapCartPayload(rootModel.cart, mutationRootKey);
      });
    }

    if (errors && errors.length) {
      return Promise.reject(new Error(JSON.stringify(errors)));
    }

    if (rootData && (rootData.userErrors || rootData.warnings)) {
      const checkoutUserErrors = checkoutUserErrorsMapper(rootData.userErrors, rootData.warnings);

      return Promise.reject(new Error(JSON.stringify(checkoutUserErrors)));
    }

    return Promise.reject(new Error(`The ${mutationRootKey} mutation failed due to an unknown error.`));
  };
}
