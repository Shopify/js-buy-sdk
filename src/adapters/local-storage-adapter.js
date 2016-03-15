import CoreObject from '../metal/core-object';
import guidFor from '../metal/guid-for';

const LocalStorageAdapter = CoreObject.extend({
  constructor() {
  },

  idKeyForType() {
    return 'token';
  },

  fetchSingle(type, id) {
    return new Promise((resolve, reject) => {
      const stringifiedValue = localStorage.getItem(this.localStorageKey(type, id));

      if (stringifiedValue === null) {
        reject(new Error(`${type}#${id} not found`));

        return;
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
    return new Promise((resolve, reject) => {
      const id = this.identify(payload);

      try {
        localStorage.setItem(this.localStorageKey(type, id), JSON.stringify(payload));
      } catch (e) {
        reject(e);
      }

      resolve(payload);
    });
  },

  update(type, id, payload) {
    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(this.localStorageKey(type, id), JSON.stringify(payload));
      } catch (e) {
        reject(e);
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
      return guidFor(payload[keys[0]]);
    }

    return guidFor(payload);
  }
});

export default LocalStorageAdapter;
