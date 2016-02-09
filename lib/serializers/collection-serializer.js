import CoreObject from 'buy-button-sdk/metal/core-object';
import BaseModel from 'buy-button-sdk/models/base-model';

const CollectionSerializer = CoreObject.extend({
  constructor() {
  },

  deserializeSingle(singlePayload, metaAttrs) {
    const models = singlePayload.collection_publications;
    const model = this.modelFromAttrs(models[0], metaAttrs);

    return model;
  },

  deserializeCollection(collectionPayload, metaAttrs) {
    const models = collectionPayload.collection_publications;

    return models.map(attrs => {
      const model = this.modelFromAttrs(attrs, metaAttrs);

      return model;
    });
  },

  modelFromAttrs(attrs, metaAttrs) {
    return new BaseModel(attrs, metaAttrs);
  }
});

export default CollectionSerializer;
