
import ajax from 'buy-button-sdk/ajax';

function CollectionAdapter(config) {
  Object.defineProperty(this, 'config', {
    enumerable: false,
    writable: true,
    configurable: false,
    value: config
  });
}

Object.defineProperties(CollectionAdapter.prototype, {
  ajax: {
    enumerable: false,
    configurable: false,
    writable: true,
    value: ajax
  },

  base64ApiKey: {
    get() {
      return btoa(this.config.apiKey);
    },
    enumerable: true,
    configurable: false
  },

  baseUrl: {
    get() {
      const { myShopifyDomain, channelId } = this.config;

      return `https://${myShopifyDomain}.myshopify.com/api/channels/${channelId}`;
    },
    enumerable: true,
    configurable: false
  },

  headers: {
    get() {
      const { apiKey } = this.config;
      const encodedApiKey = btoa(apiKey);

      return {
        Authorization: `Basic ${encodedApiKey}`
      };
    },
    enumerable: true,
    configurable: false
  },

  buildUrl: {
    configurable: true,
    enumerable: false,
    value: function (type, idOrQuery) {
      switch (type) {
          case 'collection':
            return this.buildCollectionUrl(idOrQuery);
          case 'single':
            return this.buildSingleUrl(idOrQuery);
          default:
            return '';
      }
    }
  },

  buildCollectionUrl: {
    configurable: true,
    enumerable: false,
    value: function (query = {}) {
      const url = `${this.baseUrl}/collection_publications.json`;
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
    }
  },

  buildSingleUrl: {
    configurable: true,
    enumerable: false,
    value: function (id) {
      return this.buildCollectionUrl({ collection_ids: [id] });
    }
  },

  fetchCollection: {
    configurable: true,
    enumerable: false,
    value: function () {
      const url = this.buildUrl('collection', ...arguments);

      return this.ajax('get', url, { headers: this.headers }).then(response => {
        return response.json;
      });
    }
  },

  fetchSingle: {
    configurable: true,
    enumerable: false,
    value: function (id) {
      const url = this.buildUrl('single', id);

      return this.ajax('get', url, { headers: this.headers }).then(response => {
        return response.json;
      });
    }
  }
});


export default CollectionAdapter;
