import CoreObject from 'buy-button-sdk/metal/core-object';
import BaseModel from 'buy-button-sdk/models/base-model';

const CollectionSerializer = CoreObject.extend({
  constructor() {
  },

  serializeSingle(singlePayload, shopClient) {
    const models = singlePayload.collection_publications;
    const model = this.modelFromAttrs(models[0], shopClient);

    return model;
  },

  serializeCollection(collectionPayload, shopClient) {
    const models = collectionPayload.collection_publications;

    return models.map(attrs => {
      const model = this.modelFromAttrs(attrs, shopClient);

      return model;
    });
  },

  modelFromAttrs(attrs, shopClient) {
    return new BaseModel(attrs, this, shopClient);
  }
});

export default CollectionSerializer;
