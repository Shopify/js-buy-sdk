import CoreObject from 'buy-button-sdk/metal/core-object';

/**
 * @module js-buy-sdk
 * @submodule config
 */

const Config = CoreObject.extend({
  /**
   * @class Config
   * @constructor
   * @param {Object} attrs A hash of required config data.
   * @param {String} attrs.apiKey Your api client's public token
   * @param {String} attrs.channelId The channel from which to read
   * publications. Visit `<your-shops-domain>/admin/channels.json` while
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
   * @default ['apiKey', 'channelId', 'myShopifyDomain']
   * @type Array
   * @private
   */
  requiredProperties: [
    'apiKey',
    'channelId',
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
   * @attribute channelId
   * @default ''
   * @type String
   * @public
   */
  channelId: '',

  /**
   * @attribute myShopifyDomain
   * @default ''
   * @type String
   * @public
   */
  myShopifyDomain: ''
});

export default Config;
