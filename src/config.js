/**
 * The class used to configure the JS Buy SDK Client.
 * @class
 */
class Config {

  /**
   * Properties that must be set on initializations
   * @attribute requiredProperties
   * @default ['storefrontAccessToken', 'domain']
   * @type Array
   * @private
   */
  get requiredProperties() {
    return [
      'storefrontAccessToken',
      'domain'
    ];
  }

  /**
   * Deprecated properties that map directly to required properties
   * @attribute deprecatedProperties
   * @default {'accessToken': 'storefrontAccessToken', 'apiKey': 'storefrontAccessToken'}
   * @type Object
   * @private
   */
  get deprecatedProperties() {
    return {
      accessToken: 'storefrontAccessToken',
      apiKey: 'storefrontAccessToken'
    };
  }

  /**
   * @constructs Config
   * @param {Object} attrs An object specifying the configuration. Requires the following properties:
   *   @param {String} attrs.storefrontAccessToken The {@link https://help.shopify.com/api/reference/storefront_access_token|Storefront access token} for the shop.
   *   @param {String} attrs.domain The `myshopify` domain for the shop (e.g. `graphql.myshopify.com`).
   */
  constructor(attrs) {
    Object.keys(this.deprecatedProperties).forEach((key) => {
      if (!attrs.hasOwnProperty(key)) { return; }
      // eslint-disable-next-line no-console
      console.warn(`[ShopifyBuy] Config property ${key} is deprecated as of v1.0, please use ${this.deprecatedProperties[key]} instead.`);
      attrs[this.deprecatedProperties[key]] = attrs[key];
    });

    this.requiredProperties.forEach((key) => {
      if (attrs.hasOwnProperty(key)) {
        this[key] = attrs[key];
      } else {
        throw new Error(`new Config() requires the option '${key}'`);
      }
    });

    if (attrs.hasOwnProperty('apiVersion')) {
      this.apiVersion = attrs.apiVersion;
    } else {
      this.apiVersion = '2019-07';
    }
  }
}

export default Config;
