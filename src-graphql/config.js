export default class Config {

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
