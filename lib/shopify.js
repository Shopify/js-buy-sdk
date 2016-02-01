import Config from './config';
import ShopClient from './shop-client';

const Shopify = Object.create(Object.prototype, {
  Config,
  init(config) {
    Object.defineProperty(this, 'config', {
      enumerable: true,
      writable: false,
      configurable: false,
      value: config
    });

    this.shopClient = new ShopClient(config);
  }
});

export default Shopify;
