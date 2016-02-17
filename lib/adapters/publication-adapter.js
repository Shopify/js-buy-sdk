import ajax from 'buy-button-sdk/ajax';
import CoreObject from 'buy-button-sdk/metal/core-object';


const PublicationAdapter = CoreObject.extend({
  ajax,

  constructor(config) {
    this.config = config;
  },

  get base64ApiKey() {
    return btoa(this.config.apiKey);
  },

  get baseUrl() {
    const { myShopifyDomain, channelId } = this.config;

    return `https://${myShopifyDomain}.myshopify.com/api/channels/${channelId}`;
  },

  get headers() {
    return {
      Authorization: `Basic ${this.base64ApiKey}`
    };
  },

  idKeyForType(type) {
    return `${type.slice(0, -1)}_ids`;
  },

  pathForType(type) {
    return `/${type.slice(0, -1)}_publications.json`;
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
    const url = `${this.baseUrl}${this.pathForType(type)}`;
    const paramNames = Object.keys(query);

    if (paramNames.length > 0) {
      const queryString = paramNames.map(key => {
        let value;

        if (Array.isArray(query[key])) {
          value = query[key].join(',');
        } else {
          value = query[key];
        }

        return `${key}=${encodeURIComponent(value)}`;
      }).join('&');

      return `${url}?${queryString}`;
    }

    return url;
  },

  buildSingleUrl(type, id) {
    const key = this.idKeyForType(type);
    const opts = {};

    opts[key] = [id];

    return this.buildMultipleUrl(type, opts);
  },

  fetchMultiple(/* type, [query] */) {
    const url = this.buildUrl('multiple', ...arguments);

    return this.ajax('get', url, { headers: this.headers }).then(response => {
      return response.json;
    });
  },

  fetchSingle(/* type, id */) {
    const url = this.buildUrl('single', ...arguments);

    return this.ajax('get', url, { headers: this.headers }).then(response => {
      return response.json;
    });
  }
});

export default PublicationAdapter;
