function ProductSerializer() {
}

Object.defineProperties(ProductSerializer.prototype, {
  serializeSingle: {
    configurable: true,
    enumerable: false,
    value: function (singlePayload) {
      const models = singlePayload.product_publications;

      return this.modelFromAttrs(models[0]);
    }
  },

  serializeCollection: {
    configurable: true,
    enumerable: false,
    value: function (collectionPayload) {
      const models = collectionPayload.product_publications;

      return models.map(attrs => {
        return this.modelFromAttrs(attrs);
      });
    }
  },

  modelFromAttrs: {
    configurable: true,
    enumerable: false,
    value: function (attrs) {
      return Object.create(Object.prototype, {
        serializer: {
          configurable: true,
          writable: true,
          enumerable: true,
          value: this
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
