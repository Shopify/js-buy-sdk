const configOptions = [
  'myShopifyDomain',
  'apiKey',
  'channelId'
];

function DataStore(config) {
  configOptions.forEach(key => {
    Object.defineProperty(this, key, {
      enumerable: true,
      writable: true,
      configurable: false,
      value: config[key]
    });
  });
}

Object.defineProperties(DataStore.prototype, {
  base64ApiKey: {
    get() {
      return btoa(this.apiKey);
    },
    enumerable: true,
    writeable: false,
    configurable: false
  }
});

export default DataStore;
