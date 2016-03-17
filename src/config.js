import CoreObject from './metal/core-object';

/**
 * @module shopify-buy
 * @submodule config
 */

const Config = CoreObject.extend({
  /**
   * @class Config
   * @constructor
   * @param {Object} attrs A hash of required config data.
   * @param {String} attrs.apiKey Your api client's public token
   * @param {String} attrs.appId The channel from which to read
   * listings. Visit `<your-shops-domain>/admin/channels.json` while
   * authenticated to see a list of available channels.
   * @param {String} attrs.myShopifyDomain You shop's `myshopify.com` domain.
   */
  constructor(attrs) {
    this.requiredProperties.forEach(key => {
      if (!attrs.hasOwnProperty(key)) {
        throw new Error(`new Config() requires the option '${key}'`);
      } else {
        this[key] = attrs[key];
      }
    });
  },

  /**
   * The apiKey for authenticating against shopify. This is your api client's
   * public api token. Not the shared secret. Set during initialation.
   * @attribute requiredProperties
   * @default ['apiKey', 'appId', 'myShopifyDomain']
   * @type Array
   * @private
   */
  requiredProperties: [
    'apiKey',
    'appId',
    'myShopifyDomain'
  ],


  /**
   * The apiKey for authenticating against shopify. This is your api client's
   * public api token. Not the shared secret. Set during initialation.
   * @attribute apiKey
   * @default ''
   * @type String
   * @public
   */
  apiKey: '',

  /**
   * @attribute appId
   * @default ''
   * @type String
   * @public
   */
  appId: '',

  /**
   * @attribute myShopifyDomain
   * @default ''
   * @type String
   * @public
   */
  myShopifyDomain: ''
});

export default Config;
