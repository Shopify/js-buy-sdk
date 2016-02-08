import ajax from 'buy-button-sdk/ajax';
import CoreObject from 'buy-button-sdk/metal/core-object';


const ProductAdapter = CoreObject.extend({
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

  buildUrl(type, idOrQuery) {
    switch (type) {
        case 'collection':
          return this.buildCollectionUrl(idOrQuery);
        case 'single':
          return this.buildSingleUrl(idOrQuery);
        default:
          return '';
    }
  },

  buildCollectionUrl(query = {}) {
    const url = `${this.baseUrl}/product_publications.json`;
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

  buildSingleUrl(id) {
    return this.buildCollectionUrl({ product_ids: [id] });
  },

  fetchCollection() {
    const url = this.buildUrl('collection', ...arguments);

    return this.ajax('get', url, { headers: this.headers }).then(response => {
      return response.json;
    });
  },

  fetchSingle(id) {
    const url = this.buildUrl('single', id);

    return this.ajax('get', url, { headers: this.headers }).then(response => {
      return response.json;
    });
  }
});

export default ProductAdapter;
