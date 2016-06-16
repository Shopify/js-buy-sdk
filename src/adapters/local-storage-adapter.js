import CoreObject from '../metal/core-object';
import setGuidFor from '../metal/set-guid-for';
import { GUID_KEY } from '../metal/set-guid-for';

const LocalStorageAdapter = CoreObject.extend({
  constructor() {
    this.store = {};
  },

  idKeyForType(/* type */) {
    return GUID_KEY;
  },

  fetchSingle(type, id) {
    return new Promise((resolve, reject) => {
      const stringifiedValue = localStorage.getItem(this.localStorageKey(type, id));

      if (stringifiedValue === null) {
        const storeValue = this.store[this.localStorageKey(type, id)];

        if (storeValue === null) {
          reject(new Error(`${type}#${id} not found`));
        } else {
          resolve(storeValue);
        }
      }

      try {
        const value = JSON.parse(stringifiedValue);

        resolve(value);
      } catch (e) {
        reject(e);
      }
    });
  },

  create(type, payload) {
    return new Promise(resolve => {
      const id = this.identify(payload);

      try {
        localStorage.setItem(this.localStorageKey(type, id), JSON.stringify(payload));
      } catch (e) {
        this.store[this.localStorageKey(type, id)] = payload;
      }

      resolve(payload);
    });
  },

  update(type, id, payload) {
    return new Promise(resolve => {
      try {
        localStorage.setItem(this.localStorageKey(type, id), JSON.stringify(payload));
      } catch (e) {
        this.store[this.localStorageKey(type, id)] = payload;
      }

      resolve(payload);
    });
  },

  localStorageKey(type, id) {
    return `${type}.${id}`;
  },

  identify(payload) {
    const keys = Object.keys(payload);

    if (keys.length === 1 && typeof payload[keys[0]] === 'object') {
      return setGuidFor(payload[keys[0]]);
    }

    return setGuidFor(payload);
  }
});

export default LocalStorageAdapter;
