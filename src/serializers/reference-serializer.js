import CoreObject from '../metal/core-object';
import assign from '../metal/assign';
import ReferenceModel from '../models/reference-model';

const ReferenceSerializer = CoreObject.extend({
  constructor(config) {
    this.config = config;
  },

  modelForType(/* type */) {
    return ReferenceModel;
  },

  deserializeSingle(type, singlePayload = {}, metaAttrs = {}) {
    const Model = this.modelForType(type);

    return new Model(singlePayload, metaAttrs);
  },

  serialize(type, model) {
    const attrs = assign({}, model.attrs);

    return attrs;
  }
});

export default ReferenceSerializer;
