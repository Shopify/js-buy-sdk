function DataStore(config) {
  this.config = config;
}

Object.defineProperties(DataStore.prototype, {
  config: {
    enumerable: true,
    writable: true,
    configurable: true,
    value: null
  },

  serializers: {
    enumerable: true,
    writable: true,
    configurable: true,
    value: {}
  },

  adapters: {
    enumerable: true,
    writable: true,
    configurable: true,
    value: {}
  },

  fetchAll: {
    configurable: true,
    enumerable: false,
    value: function (type) {
      const adapter = new this.adapters[type](this.config);
      const serializer = new this.serializers[type](this.config);

      return adapter.fetchCollection().then(payload => {
        return serializer.serializeCollection(payload);
      });
    }
  },

  fetchOne: {
    configurable: true,
    enumerable: false,
    value: function (type, id) {
      const adapter = new this.adapters[type](this.config);
      const serializer = new this.serializers[type](this.config);

      return adapter.fetchSingle(id).then(payload => {
        return serializer.serializeSingle(payload);
      });
    }
  },

  fetchQuery: {
    configurable: true,
    enumerable: false,
    value: function (type, query) {
      const adapter = new this.adapters[type](this.config);
      const serializer = new this.serializers[type](this.config);

      return adapter.fetchCollection(query).then(payload => {
        return serializer.serializeCollection(payload);
      });
    }
  }
});

export default DataStore;
