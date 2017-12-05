export default function defaultResolver(path) {
  const keys = path.split('.');

  return function({model}) {
    return keys.reduce((ref, key) => {
      return ref[key];
    }, model);
  };
}
