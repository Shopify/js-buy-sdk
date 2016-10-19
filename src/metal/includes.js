let includes;

if (!Array.prototype.includes) {
  includes = function (array, searchElement) {
    const ObjectifiedArray = Object(array);
    const length = parseInt(ObjectifiedArray.length, 10) || 0;

    if (length === 0) {
      return false;
    }

    const startIndex = parseInt(arguments[2], 10) || 0;
    let index;

    if (startIndex >= 0) {
      index = startIndex;
    } else {
      index = length + startIndex;

      if (index < 0) {
        index = 0;
      }
    }

    while (index < length) {
      const currentElement = ObjectifiedArray[index];

      /* eslint no-self-compare:0 */
      if (searchElement === currentElement ||
         (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
        return true;
      }
      index++;
    }

    return false;
  };
} else {
  includes = function (array) {
    const args = [].slice.call(arguments, 1);

    return Array.prototype.includes.apply(array, args);
  };
}

export default includes;
