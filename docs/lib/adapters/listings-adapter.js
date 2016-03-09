'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ajax = require('../ajax');

var _ajax2 = _interopRequireDefault(_ajax);

var _coreObject = require('../metal/core-object');

var _coreObject2 = _interopRequireDefault(_coreObject);

var _version = require('../version');

var _version2 = _interopRequireDefault(_version);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ListingsAdapter = _coreObject2.default.extend({
  ajax: _ajax2.default,

  constructor: function constructor(config) {
    this.config = config;
  },


  get base64ApiKey() {
    return btoa(this.config.apiKey);
  },

  get baseUrl() {
    var _config = this.config;
    var domain = _config.domain;
    var appId = _config.appId;


    return 'https://' + domain + '/api/apps/' + appId;
  },

  get headers() {
    return {
      Authorization: 'Basic ' + this.base64ApiKey,
      'Content-Type': 'application/json',
      'X-SDK-Variant': 'javascript',
      'X-SDK-Version': _version2.default

    };
  },

  pathForType: function pathForType(type) {
    return '/' + type.slice(0, -1) + '_listings';
  },
  buildUrl: function buildUrl(singleOrMultiple, type, idOrQuery) {
    switch (singleOrMultiple) {
      case 'multiple':
        return this.buildMultipleUrl(type, idOrQuery);
      case 'single':
        return this.buildSingleUrl(type, idOrQuery);
      default:
        return '';
    }
  },
  buildMultipleUrl: function buildMultipleUrl(type) {
    var query = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var url = '' + this.baseUrl + this.pathForType(type);
    var paramNames = Object.keys(query);

    if (paramNames.length > 0) {
      var queryString = paramNames.map(function (key) {
        var value = void 0;

        if (Array.isArray(query[key])) {
          value = query[key].join(',');
        } else {
          value = query[key];
        }

        return key + '=' + encodeURIComponent(value);
      }).join('&');

      return url + '?' + queryString;
    }

    return url;
  },
  buildSingleUrl: function buildSingleUrl(type, id) {
    return '' + this.baseUrl + this.pathForType(type) + '/' + id;
  },
  fetchMultiple: function fetchMultiple() /* type, [query] */{
    var url = this.buildUrl.apply(this, ['multiple'].concat(Array.prototype.slice.call(arguments)));

    return this.ajax('GET', url, { headers: this.headers }).then(function (response) {
      return response.json;
    });
  },
  fetchSingle: function fetchSingle() /* type, id */{
    var url = this.buildUrl.apply(this, ['single'].concat(Array.prototype.slice.call(arguments)));

    return this.ajax('GET', url, { headers: this.headers }).then(function (response) {
      return response.json;
    });
  }
});

exports.default = ListingsAdapter;