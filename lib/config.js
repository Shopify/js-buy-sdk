const requiredProperties = [
  'apiKey',
  'channelId',
  'myShopifyDomain'
];


export default function Config(attrs) {
  requiredProperties.forEach(key => {
    if (!attrs.hasOwnProperty(key)) {
      throw new Error(`new Config() requires the option '${key}'`);
    } else {
      Object.defineProperty(this, key, {
        enumerable: true,
        writable: false,
        configurable: false,
        value: attrs[key]
      });
    }
  });
}
