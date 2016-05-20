import ajax from '../ajax';
import CoreObject from '../metal/core-object';
import version from '../version';

const ListingsAdapter = CoreObject.extend({
  ajax,

  constructor(config) {
    this.config = config;
  },

  get base64ApiKey() {
    return btoa(this.config.apiKey);
  },

  get baseUrl() {
    const { myShopifyDomain, appId } = this.config;

    return `https://${myShopifyDomain}.myshopify.com/api/apps/${appId}`;
  },

  get headers() {
    return {
      Authorization: `Basic ${this.base64ApiKey}`,
      'Content-Type': 'application/json',
      'X-SDK-Variant': 'javascript',
      'X-SDK-Version': version

    };
  },

  pathForType(type) {
    return `/${type.slice(0, -1)}_listings`;
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
    return `${this.baseUrl}${this.pathForType(type)}/${id}`;
  },

  fetchMultiple(/* type, [query] */) {
    const url = this.buildUrl('multiple', ...arguments);

    return this.ajax('GET', url, { headers: this.headers }).then(response => {
      return response.json;
    });
  },

  fetchSingle(/* type, id */) {
    const url = this.buildUrl('single', ...arguments);

    return this.ajax('GET', url, { headers: this.headers }).then(response => {
      return response.json;
    });
  }
});

export default ListingsAdapter;
