/* eslint no-undefined: 0 */

let assign;

if (typeof Object.assign === 'function') {
  assign = Object.assign;
} else {
  assign = function (target) {
    if (target === undefined || target === null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    const output = Object(target);

    const propertyObjects = [].slice.call(arguments, 1);

    if (propertyObjects.length > 0) {
      propertyObjects.forEach(source => {
        if (source !== undefined && source !== null) {
          let nextKey;

          for (nextKey in source) {
            if (source.hasOwnProperty(nextKey)) {
              output[nextKey] = source[nextKey];
            }
          }
        }
      });
    }

    return output;
  };
}

export default assign;
