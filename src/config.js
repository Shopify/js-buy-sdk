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
   * @constructs Config
   * @param {Object} attrs An object specifying the configuration. Requires the following properties:
   *   @param {String} attrs.storefrontAccessToken The {@link https://help.shopify.com/api/reference/storefront_access_token|Storefront access token} for the shop.
   *   @param {String} attrs.domain The `myshopify` domain for the shop (e.g. `graphql.myshopify.com`).
   */
  constructor(attrs) {
    this.requiredProperties.forEach((key) => {
      if (attrs.hasOwnProperty(key)) {
        this[key] = attrs[key];
      } else {
        throw new Error(`new Config() requires the option '${key}'`);
      }
    });
  }
}

export default Config;
