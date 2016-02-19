import ajax from 'buy-button-sdk/ajax';
import CoreObject from 'buy-button-sdk/metal/core-object';

const CheckoutAdapter = CoreObject.extend({
  ajax,

  constructor(config) {
    this.config = config;
  },

  get base64ApiKey() {
    return btoa(this.config.apiKey);
  },

  get baseUrl() {
    const { myShopifyDomain } = this.config;

    return `https://${myShopifyDomain}.myshopify.com/anywhere`;
  },

  get headers() {
    return {
      Authorization: `Basic ${this.base64ApiKey}`
    };
  },

  idKeyForType() {
    return 'token';
  },

  pathForType(type) {
    return `/${type}`;
  },

  buildUrl(singleOrMultiple, type, idOrQuery) {
    switch (singleOrMultiple) {
        case 'multiple':
          return this.buildMultipleUrl(type, idOrQuery);
        case 'single':
          return this.buildSingleUrl(type, idOrQuery);
        default:
          return '';
    }
  },

  buildMultipleUrl(type, query = {}) {
    const url = `${this.baseUrl}${this.pathForType(type)}.json`;
    const paramNames = Object.keys(query);

    if (paramNames.length > 0) {
      throw new Error('Querying checkouts is not allowed');
    }

    return url;
  },

  buildSingleUrl(type, id) {
    return `${this.baseUrl}${this.pathForType(type)}/${id}.json`;
  },

  fetchSingle(/* type, id */) {
    const url = this.buildUrl('single', ...arguments);

    return this.ajax('get', url, { headers: this.headers }).then(response => {
      return response.json;
    });
  },

  create(type, payload) {
    const url = this.buildUrl('multiple', type);

    return this.ajax('post', url, { headers: this.headers, body: JSON.stringify(payload) }).then(response => {
      return response.json;
    });
  },

  update(type, id, payload) {
    const url = this.buildUrl('single', type, id);

    return this.ajax('patch', url, { headers: this.headers, body: JSON.stringify(payload) }).then(response => {
      return response.json;
    });
  }
});

export default CheckoutAdapter;
