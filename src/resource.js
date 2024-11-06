import InputMapper from './input-map-resource';
import PayloadMapper from './payload-map-resource';

export default class Resource {
  constructor(client) {
    this.graphQLClient = client;
    this.inputMapper = new InputMapper();
    this.payloadMapper = new PayloadMapper(client);
  }
}
