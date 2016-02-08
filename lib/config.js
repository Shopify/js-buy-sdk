import CoreObject from 'buy-button-sdk/metal/core-object';


const Config = CoreObject.extend({
  constructor(attrs) {
    this.requiredProperties.forEach(key => {
      if (!attrs.hasOwnProperty(key)) {
        throw new Error(`new Config() requires the option '${key}'`);
      } else {
        this[key] = attrs[key];
      }
    });
  },

  requiredProperties: [
    'apiKey',
    'channelId',
    'myShopifyDomain'
  ],

  apiKey: '',
  channelId: '',
  myShopifyDomain: ''
});

export default Config;
