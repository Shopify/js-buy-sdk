import CoreObject from 'buy-button-sdk/metal/core-object';
import BaseModel from 'buy-button-sdk/models/base-model';

const PublicationSerializer = CoreObject.extend({
  constructor() {
  },

  rootKeyForType(type) {
    return `${type.slice(0, -1)}_publications`;
  },

  modelForType(/* type */) {
    return BaseModel;
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
