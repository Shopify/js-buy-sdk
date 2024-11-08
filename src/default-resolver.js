export const defaultErrors = [{message: 'an unknown error has occurred.'}];

export default function defaultResolver() {
  return function({model, data, errors}) {
    return new Promise((resolve, reject) => {
      if (data.cart === null) {
        resolve(null);
      }
      try {
        data.cart.attrs = model.attrs.cart;

        resolve(data.cart);
      } catch (_) {
        if (errors) {
          reject(errors);
        } else {
          reject(defaultErrors);
        }
      }
    });
  };
}
