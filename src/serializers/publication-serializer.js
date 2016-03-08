import CoreObject from '../metal/core-object';
import BaseModel from '../models/base-model';
import ProductModel from '../models/product-model';

const PublicationSerializer = CoreObject.extend({
  constructor() {
  },

  rootKeyForType(type) {
    return `${type.slice(0, -1)}_publications`;
  },

  models: {
    collections: BaseModel,
    products: ProductModel
  },

  modelForType(type) {
    return this.models[type];
  },

  deserializeSingle(type, singlePayload, metaAttrs) {
    const models = singlePayload[this.rootKeyForType(type)];
    const model = this.modelFromAttrs(type, models[0], metaAttrs);

    return model;
  },

  deserializeMultiple(type, collectionPayload, metaAttrs) {
    const models = collectionPayload[this.rootKeyForType(type)];

    return models.map(attrs => {
      const model = this.modelFromAttrs(type, attrs, metaAttrs);

      return model;
    });
  },

  modelFromAttrs(type, attrs, metaAttrs) {
    const Model = this.modelForType(type);

    return new Model(attrs, metaAttrs);
  }
});

export default PublicationSerializer;
