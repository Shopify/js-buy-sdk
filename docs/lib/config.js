'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _coreObject = require('./metal/core-object');

var _coreObject2 = _interopRequireDefault(_coreObject);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @module shopify-buy
 * @submodule config
 */

var Config = _coreObject2.default.extend({
  /**
   * @class Config
   * @constructor
   * @param {Object} attrs An object of required config data.
   * @param {String} attrs.apiKey Your api client's public token
   * @param {String} attrs.appId The app whose listings the client will be
   * using. If you are just modifying a buy button, the buy-button's app id is
   * 6. Otherwise, obtain the app id of the app you're modifying or extending.
   * @param {String} attrs.domain Your shop's full domain. (i.e. `craftedgoods.myshopify.com`)
   */
  constructor: function constructor(attrs) {
    var _this = this;

    Object.keys(this.deprecatedProperties).forEach(function (key) {
      if (attrs.hasOwnProperty(key)) {
        var transformName = _this.deprecatedProperties[key];
        var transform = _this[transformName];

        transform(attrs[key], attrs);
      }
    });
    this.requiredProperties.forEach(function (key) {
      if (!attrs.hasOwnProperty(key)) {
        throw new Error('new Config() requires the option \'' + key + '\'');
      } else {
        _this[key] = attrs[key];
      }
    });
  },


  /**
   * An object with keys for deprecated properties and values as functions that
   * will transform the value into a usable value. A depracation transform should
   * have the value signature function(deprecated_value, config_to_be_transformed)
   * @attribute deprecatedProperties
   * @default { myShopifyDomain: this.transformMyShopifyDomain }
   * @type Object
   * @private
   */
  deprecatedProperties: {
    myShopifyDomain: 'transformMyShopifyDomain'
  },

  /**
   * Transform the myShopifyDomain config to a domain config.
   * @method transformMyShopifyDomain
   * @static
   * @private
   * @param {String} subdomain The original subdomain on myshopify.com
   * @param {Object} attrs. The config attributes to be transformed to a
   * non-deprecated state.
   * @return {Object} the transformed config attributes.
   */
  transformMyShopifyDomain: function transformMyShopifyDomain(subdomain, attrs) {
    _logger2.default.warn('Config - ', 'myShopifyDomain is deprecated, please use domain and provide the full shop domain.');
    attrs.domain = subdomain + '.myshopify.com';
  },


  /**
   * Properties that must be set on initializations
   * @attribute requiredProperties
   * @default ['apiKey', 'appId', 'myShopifyDomain']
   * @type Array
   * @private
   */
  requiredProperties: ['apiKey', 'appId', 'domain'],

  /**
   * The apiKey for authenticating against shopify. This is your api client's
   * public api token. Not the shared secret. Set during initialation.
   * @attribute apiKey
   * @default ''
   * @type String
   * @public
   */
  apiKey: '',

  /**
   * @attribute appId
   * @default ''
   * @type String
   * @public
   */
  appId: '',

  /**
   * The domain that all the api requests will go to
   * @attribute domain
   * @default ''
   * @type String
   * @public
   */
  domain: '',

  /**
   * The subdomain of myshopify.io that all the api requests will go to
   * @attribute myShopifyDomain
   * @default ''
   * @type String
   * @public
   * @deprecated Use `config.domain` instead.
   */
  myShopifyDomain: ''
});

exports.default = Config;