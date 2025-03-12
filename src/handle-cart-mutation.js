import {mapCartPayload} from './cart-payload-mapper';
import checkoutUserErrorsMapper from './checkout-map-user-error-codes';

export default function handleCartMutation(mutationRootKey, client) {
  return function({data = {}, errors, model = {}}) {
    const rootData = data[mutationRootKey];
    const rootModel = model[mutationRootKey];

    if (rootData && rootData.cart) {
      return client.fetchAllPages(rootModel.cart.lines, {pageSize: 250}).then((lines) => {
        rootModel.cart.attrs.lines = lines;
        const checkoutUserErrors = checkoutUserErrorsMapper(rootData.userErrors, rootData.warnings);

        try {
          return Object.assign({},
            mapCartPayload(rootModel.cart, mutationRootKey),
            {userErrors: checkoutUserErrors, errors: rootModel.cart.errors}
          );
        } catch (error) {
          return Promise.reject(error);
        }
      });
    }

    if (errors && errors.length) {
      return Promise.reject(new Error(JSON.stringify(errors)));
    }

    if (rootData && (rootData.userErrors.length || rootData.warnings.length)) {
      const checkoutUserErrors = checkoutUserErrorsMapper(rootData.userErrors, rootData.warnings);

      return Promise.reject(checkoutUserErrors);
    }

    return Promise.reject(new Error(`The ${mutationRootKey} mutation failed due to an unknown error.`));
  };
}
