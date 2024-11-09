import PayloadMapper from './payload-map-resource';

export const defaultErrors = [{message: 'an unknown error has occurred.'}];

export default function defaultResolver(key, client) {
  const payloadMapper = new PayloadMapper(client);

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

        return payloadMapper.checkout(rootData);
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
