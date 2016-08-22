import Config from './config';
import version from './version';
import ShopClient from './shop-client';
import './isomorphic-fetch';
import './isomorphic-btoa';
import { NO_IMAGE_URI } from './models/product-model';

/**
 * @module shopify-buy
 * @submodule shopify
 */

/**
 * This namespace contains all globally accessible classes
 * @class ShopifyBuy
 * @static
 */
const Shopify = {
  ShopClient,
  Config,
  version,
  NO_IMAGE_URI: NO_IMAGE_URI,

  /**
   * Create a ShopClient. This is the main entry point to the SDK.
   *
   * ```javascript
   * const client = ShopifyBuy.buildClient({
   *   apiKey: 'abc123',
   *   appId: 123456,
   *   myShopifyDomain: 'myshop',
   *   domain: 'myshop.myshopify.com'
   * });
   * ```
   *
   * @method buildClient
   * @for ShopifyBuy
   * @static
   * @public
   * @param {Object} configAttrs An object of required config data.
   * @param {String} configAttrs.apiKey Your api client's public token.
   * @param {String} configAttrs.appId The app whose listings the client will be
   * using. If you are just modifying a buy button, the buy-button's app id is
   * 6. Otherwise, obtain the app id of the app you're modifying or extending.
   * @param {String} configAttrs.domain You shop's full `myshopify.com` domain.
   * @return {ShopClient} a client for the shop using your api credentials.
   */
  buildClient(configAttrs = {}) {
    const config = new this.Config(configAttrs);

    return new this.ShopClient(config);
  }
};

export default Shopify;
