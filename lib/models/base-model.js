import CoreObject from 'buy-button-sdk/metal/core-object';

const BaseModel = CoreObject.extend({
  constructor(attrs, serializer, shopClient) {
    this.attrs = attrs;
    this.serializer = serializer;
    this.shopClient = shopClient;
  },
  attrs: null,
  serializer: null,
  shopClient: null
});

export default BaseModel;
