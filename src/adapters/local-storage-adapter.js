import CoreObject from '../metal/core-object';
import setGuidFor from '../metal/set-guid-for';
import Store from '../store';
import GUID_KEY from '../metal/guid-key';

const LocalStorageAdapter = CoreObject.extend({
  constructor() {
    this.store = new Store();
  },

  idKeyForType(/* type */) {
    return GUID_KEY;
  },

  fetchSingle(type, id) {
    return new Promise((resolve, reject) => {
      const value = this.store.getItem(this.storageKey(type, id));

      if (value === null) {
        reject(new Error(`${type}#${id} not found`));

        return;
      }

      resolve(value);
    });
  },

  create(type, payload) {
    return new Promise(resolve => {
      const id = this.identify(payload);

      this.store.setItem(this.storageKey(type, id), payload);
      resolve(payload);
    });
  },

  update(type, id, payload) {
    return new Promise(resolve => {
      this.store.setItem(this.storageKey(type, id), payload);
      resolve(payload);
    });
  },

  storageKey(type, id) {
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
