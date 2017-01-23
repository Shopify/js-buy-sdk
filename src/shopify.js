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
 * `ShopifyBuy` only defines one function {{#crossLink "ShopifyBuy/buildClient"}}{{/crossLink}} which can
 * be used to build a {{#crossLink "ShopClient"}}{{/crossLink}} to query your store using the
 * provided
 * {{#crossLink "ShopifyBuy/buildClient/configAttrs:accessToken"}}`accessToken`{{/crossLink}},
 * {{#crossLink "ShopifyBuy/buildClient/configAttrs:appId"}}`appId`{{/crossLink}},
 * and {{#crossLink "ShopifyBuy/buildClient/configAttrs:domain"}}`domain`{{/crossLink}}.
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
   *   accessToken: 'bf081e860bc9dc1ce0654fdfbc20892d',
   *   appId: 6,
   *   myShopifyDomain: 'your-shop-subdomain.myshopify.com', //Deprecated. Use `domain` instead
   *   domain: 'embeds.myshopify.com'
   * });
   * ```
   *
   * @method buildClient
   * @for ShopifyBuy
   * @static
   * @public
   * @param {Object} configAttrs An object of required config data such as: `accessToken`, `appId`, `domain`
   * @param {String} configAttrs.accessToken An access token for your store. Documentation how to get a token:
   *                                    https://help.shopify.com/api/sdks/js-buy-sdk/getting-started#api-key
   * @param {String} configAttrs.appId Typically will be 6 which is the Buy Button App Id. For more info on App Id see:
   *                                   https://help.shopify.com/api/sdks/js-buy-sdk/getting-started#app-id
   * @param {String} configAttrs.domain Your shop's full `myshopify.com` domain. For example: `embeds.myshopify.com`
   * @param {String} configAttrs.myShopifyDomain You shop's `myshopify.com` domain. [deprecated Use configAttrs.domain]
   * @return {ShopClient} a client for the shop using your api credentials which you can use to query your store.
   */
  buildClient(configAttrs = {}) {
    const config = new this.Config(configAttrs);

    return new this.ShopClient(config);
  }
};

export default Shopify;
