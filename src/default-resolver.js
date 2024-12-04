import { mapCartPayload } from './cart-payload-mapper';

export const defaultErrors = [{message: 'an unknown error has occurred.'}];

export default function defaultResolver(key, client) {
  return function({model, data, errors}) {
    try {
      const rootData = data[key];
      const rootModel = model[key];

      if (!rootData) {
        Promise.resolve(null);
      }

      return client.fetchAllPages(rootModel.lines, {pageSize: 250}).then((lines) => {
        rootModel.attrs.lines = lines;
        rootModel.errors = errors;

        return mapCartPayload(rootData);
      });

    } catch (_) {
      if (errors) {
        Promise.reject(errors);
      } else {
        Promise.reject(defaultErrors);
      }
    }
  };
}
