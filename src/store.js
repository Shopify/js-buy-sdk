import global from './metal/global';
import CoreObject from './metal/core-object';

const Store = CoreObject.extend({
  constructor() {
    this.localStorageAvailable = this.storageAvailable('localStorage');
    this.cache = {};
  },

  setItem(key, value) {
    if (this.localStorageAvailable) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      this.cache[key] = value;
    }

    return value;
  },

  getItem(key) {
    if (this.localStorageAvailable) {
      const stringValue = localStorage.getItem(key);

      try {
        return JSON.parse(stringValue);
      } catch (e) {
        return null;
      }
    } else {
      return this.cache[key] || null;
    }
  },

  storageAvailable(type) {
    try {
      const storage = global[type];
      const x = '__storage_test__';

      storage.setItem(x, x);
      storage.removeItem(x);

      return true;
    } catch (e) {
      return false;
    }
  }
});

export default Store;
