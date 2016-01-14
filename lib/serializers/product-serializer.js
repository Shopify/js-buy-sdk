function ProductSerializer() {
}

Object.defineProperties(ProductSerializer.prototype, {
  serializeSingle: {
    configurable: true,
    enumerable: false,
    value: function (singlePayload, dataStore) {
      const models = singlePayload.product_publications;
      const model = this.modelFromAttrs(models[0], dataStore);

      return model;
    }
  },

  serializeCollection: {
    configurable: true,
    enumerable: false,
    value: function (collectionPayload, dataStore) {
      const models = collectionPayload.product_publications;

      return models.map(attrs => {
        const model = this.modelFromAttrs(attrs, dataStore);

        return model;
      });
    }
  },

  modelFromAttrs: {
    configurable: true,
    enumerable: false,
    value: function (attrs, dataStore) {
      return Object.create(Object.prototype, {
        serializer: {
          configurable: true,
          writable: true,
          enumerable: true,
          value: this
        },
        dataStore: {
          configurable: true,
          writable: true,
          enumerable: true,
          value: dataStore
        },
        attrs: {
          configurable: true,
          writable: true,
          enumerable: true,
          value: attrs
        }
      });
    }
  }
});

export default ProductSerializer;
