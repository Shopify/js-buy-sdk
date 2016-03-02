import CoreObject from '../metal/core-object';
import CheckoutModel from '../models/checkout-model';

const CheckoutSerializer = CoreObject.extend({
  constructor() {
  },

  rootKeyForType(type) {
    return type.slice(0, -1);
  },

  modelForType(/* type */) {
    return CheckoutModel;
  },

  deserializeSingle(type, singlePayload, metaAttrs) {
    const modelAttrs = singlePayload[this.rootKeyForType(type)];
    const model = this.modelFromAttrs(type, modelAttrs, metaAttrs);

    return model;
  },

  modelFromAttrs(type, attrs, metaAttrs) {
    const Model = this.modelForType(type);

    return new Model(attrs, metaAttrs);
  },

  serialize(type, model) {
    const root = this.rootKeyForType(type);
    const payload = {};

    payload[root] = model.attrs;

    return payload;
  }
});

export default CheckoutSerializer;
