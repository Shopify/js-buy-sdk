import CoreObject from 'buy-button-sdk/metal/core-object';
import assign from 'buy-button-sdk/metal/assign';

const BaseModel = CoreObject.extend({
  constructor(attrs, metaAttrs) {
    this.attrs = attrs;

    assign(this, metaAttrs);
  },
  attrs: null,
  serializer: null,
  adapter: null,
  shopClient: null
});

export default BaseModel;
