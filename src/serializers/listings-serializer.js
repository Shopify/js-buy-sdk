import CoreObject from '../metal/core-object';
import BaseModel from '../models/base-model';
import ProductModel from '../models/product-model';

const ListingsSerializer = CoreObject.extend({
  constructor(config) {
    this.config = config;
  },

  rootKeyForType(type) {
    return `${type.slice(0, -1)}_listing`;
  },

  models: {
    collections: BaseModel,
    products: ProductModel
  },

  modelForType(type) {
    return this.models[type];
  },

  deserializeSingle(type, singlePayload = {}, metaAttrs = {}) {
    const modelAttrs = singlePayload[this.rootKeyForType(type)];
    const model = this.modelFromAttrs(type, modelAttrs, metaAttrs);

    return model;
  },

  deserializeMultiple(type, collectionPayload = {}, metaAttrs = {}) {
    const models = collectionPayload[`${this.rootKeyForType(type)}s`];

    return models.map(attrs => {
      const model = this.modelFromAttrs(type, attrs, metaAttrs);

      return model;
    });
  },

  modelFromAttrs(type, attrs, metaAttrs) {
    const Model = this.modelForType(type);

    metaAttrs.config = this.config;

    return new Model(attrs, metaAttrs);
  }
});

export default ListingsSerializer;
