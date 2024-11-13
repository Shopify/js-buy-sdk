import InputMapper from './input-map-resource';
import CartPayloadMapper from './cart-payload-mapper';

export default class Resource {
  constructor(client) {
    this.graphQLClient = client;
    this.inputMapper = new InputMapper();
    this.payloadMapper = new CartPayloadMapper(client);
  }
}
