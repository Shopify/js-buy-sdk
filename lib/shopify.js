import Config from './config';
import DataStore from './data-store';

const Shopify = Object.create(Object.prototype, {
  Config,
  init(config) {
    Object.defineProperty(this, 'config', {
      enumerable: true,
      writable: false,
      configurable: false,
      value: config
    });

    this.dataStore = new DataStore(config);
  }
});

export default Shopify;
