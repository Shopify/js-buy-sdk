import InputMapper from './input-map-resource';

export default class Resource {
  constructor(client) {
    this.graphQLClient = client;
    this.inputMapper = new InputMapper();
  }
}
