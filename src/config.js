import CoreObject from './metal/core-object';
import logger from './logger';

const Config = CoreObject.extend({
  constructor(attrs) {
    Object.keys(this.deprecatedProperties).forEach(key => {
      if (attrs.hasOwnProperty(key)) {
        const transformName = this.deprecatedProperties[key];
        const transform = this[transformName];

        transform(attrs[key], attrs);
      }
    });
    this.requiredProperties.forEach(key => {
      if (!attrs.hasOwnProperty(key)) {
        throw new Error(`new Config() requires the option '${key}'`);
      } else {
        this[key] = attrs[key];
      }
    });
    this.optionalProperties.forEach(key => {
      if (attrs.hasOwnProperty(key)) {
        this[key] = attrs[key];
      }
    });
  },

  /**
   * An object with keys for deprecated properties and values as functions that
   * will transform the value into a usable value. A depracation transform should
   * have the value signature function(deprecated_value, config_to_be_transformed)
   * @attribute deprecatedProperties
   * @default { apiKey: this.transformApiKey, myShopifyDomain: this.transformMyShopifyDomain }
   * @type Object
   * @private
   */
  deprecatedProperties: {
    apiKey: 'transformApiKey',
    myShopifyDomain: 'transformMyShopifyDomain'
  },

  /**
   * Transform the myShopifyDomain config to a domain config.
   * @method transformMyShopifyDomain
   * @static
   * @private
   * @param {String} subdomain The original subdomain on myshopify.com
   * @param {Object} attrs. The config attributes to be transformed to a
   * non-deprecated state.
   * @return {Object} the transformed config attributes.
   */
  transformMyShopifyDomain(subdomain, attrs) {
    logger.warn('Config - ',
       'myShopifyDomain is deprecated, please use domain and provide the full shop domain.');
    attrs.domain = `${subdomain}.myshopify.com`;
  },

  /**
   * Transform the apiKey config to an accessToken config.
   * @method transformApiKey
   * @static
   * @private
   * @param {String} apiKey The original api key
   * @param {Object} attrs. The config attributes to be transformed to a
   * non-deprecated state.
   * @return {Object} the transformed config attributes.
   */
  transformApiKey(apiKey, attrs) {
    logger.warn('Config - ',
       'apiKey is deprecated, please use accessToken instead.');
    attrs.accessToken = apiKey;
  },

  /**
   * Properties that must be set on initializations
   * @attribute requiredProperties
   * @default ['accessToken', 'appId', 'myShopifyDomain']
   * @type Array
   * @private
   */
  requiredProperties: [
    'accessToken',
    'appId',
    'domain'
  ],

  /**
   * Properties that may be set on initializations
   * @attribute optionalProperties
   * @default ['ajaxHeaders']
   * @type Array
   * @private
   */
  optionalProperties: [
    'ajaxHeaders'
  ],

  /**
   * The accessToken for authenticating against shopify. This is your api client's
   * storefront access token. Not the shared secret. Set during initialization.
   * @attribute accessToken
   * @default ''
   * @type String
   * @private
   */
  accessToken: '',

  /**
   * The apiKey for authenticating against shopify. This is your api client's
   * public api token. Not the shared secret. Set during initialization.
   * @attribute apiKey
   * @default ''
   * @type String
   * @private
   * @deprecated Use `config.accessToken` instead.
   */
  apiKey: '',

  /**
   * @attribute appId
   * @default ''
   * @type String
   * @private
   */
  appId: '',

  /**
   * The domain that all the api requests will go to
   * @attribute domain
   * @default ''
   * @type String
   * @private
   */
  domain: '',

  /**
   * The subdomain of myshopify.io that all the api requests will go to
   * @attribute myShopifyDomain
   * @default ''
   * @type String
   * @private
   * @deprecated Use `config.domain` instead.
   */
  myShopifyDomain: '',

  /**
   * @attribute ajaxHeaders
   * @default {}
   * @type Object
   * @private
   */
  ajaxHeaders: {}
});

export default Config;
