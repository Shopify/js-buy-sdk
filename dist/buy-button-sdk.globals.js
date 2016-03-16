;(function () {
var loader, define, requireModule, require, requirejs;
var global = this;

(function() {
  'use strict';

  // Save off the original values of these globals, so we can restore them if someone asks us to
  var oldGlobals = {
    loader: loader,
    define: define,
    requireModule: requireModule,
    require: require,
    requirejs: requirejs
  };

  loader = {
    noConflict: function(aliases) {
      var oldName, newName;

      for (oldName in aliases) {
        if (aliases.hasOwnProperty(oldName)) {
          if (oldGlobals.hasOwnProperty(oldName)) {
            newName = aliases[oldName];

            global[newName] = global[oldName];
            global[oldName] = oldGlobals[oldName];
          }
        }
      }
    }
  };

  var _isArray;
  if (!Array.isArray) {
    _isArray = function (x) {
      return Object.prototype.toString.call(x) === '[object Array]';
    };
  } else {
    _isArray = Array.isArray;
  }

  var registry = {};
  var seen = {};
  var FAILED = false;
  var LOADED = true;

  var uuid = 0;

  function unsupportedModule(length) {
    throw new Error('an unsupported module was defined, expected `define(name, deps, module)` instead got: `' +
                    length + '` arguments to define`');
  }

  var defaultDeps = ['require', 'exports', 'module'];

  function Module(name, deps, callback) {
    this.id        = uuid++;
    this.name      = name;
    this.deps      = !deps.length && callback.length ? defaultDeps : deps;
    this.module    = { exports: {} };
    this.callback  = callback;
    this.state     = undefined;
    this._require  = undefined;
    this.finalized = false;
    this.hasExportsAsDep = false;
  }

  Module.prototype.makeDefaultExport = function() {
    var exports = this.module.exports;
    if (exports !== null &&
        (typeof exports === 'object' || typeof exports === 'function') &&
          exports['default'] === undefined) {
      exports['default'] = exports;
    }
  };

  Module.prototype.exports = function(reifiedDeps) {
    if (this.finalized) {
      return this.module.exports;
    } else {
      var result = this.callback.apply(this, reifiedDeps);
      if (!(this.hasExportsAsDep && result === undefined)) {
        this.module.exports = result;
      }
      this.makeDefaultExport();
      this.finalized = true;
      return this.module.exports;
    }
  };

  Module.prototype.unsee = function() {
    this.finalized = false;
    this.state = undefined;
    this.module = { exports: {}};
  };

  Module.prototype.reify = function() {
    var deps = this.deps;
    var length = deps.length;
    var reified = new Array(length);
    var dep;

    for (var i = 0, l = length; i < l; i++) {
      dep = deps[i];
      if (dep === 'exports') {
        this.hasExportsAsDep = true;
        reified[i] = this.module.exports;
      } else if (dep === 'require') {
        reified[i] = this.makeRequire();
      } else if (dep === 'module') {
        reified[i] = this.module;
      } else {
        reified[i] = findModule(resolve(dep, this.name), this.name).module.exports;
      }
    }

    return reified;
  };

  Module.prototype.makeRequire = function() {
    var name = this.name;

    return this._require || (this._require = function(dep) {
      return require(resolve(dep, name));
    });
  };

  Module.prototype.build = function() {
    if (this.state === FAILED) { return; }
    this.state = FAILED;
    this.exports(this.reify());
    this.state = LOADED;
  };

  define = function(name, deps, callback) {
    if (arguments.length < 2) {
      unsupportedModule(arguments.length);
    }

    if (!_isArray(deps)) {
      callback = deps;
      deps     =  [];
    }

    registry[name] = new Module(name, deps, callback);
  };

  // we don't support all of AMD
  // define.amd = {};
  // we will support petals...
  define.petal = { };

  function Alias(path) {
    this.name = path;
  }

  define.alias = function(path) {
    return new Alias(path);
  };

  function missingModule(name, referrer) {
    throw new Error('Could not find module `' + name + '` imported from `' + referrer + '`');
  }

  requirejs = require = requireModule = function(name) {
    return findModule(name, '(require)').module.exports;
  };

  function findModule(name, referrer) {
    var mod = registry[name] || registry[name + '/index'];

    while (mod && mod.callback instanceof Alias) {
      name = mod.callback.name;
      mod = registry[name];
    }

    if (!mod) { missingModule(name, referrer); }

    mod.build();
    return mod;
  }

  function resolve(child, name) {
    if (child.charAt(0) !== '.') { return child; }

    var parts = child.split('/');
    var nameParts = name.split('/');
    var parentBase = nameParts.slice(0, -1);

    for (var i = 0, l = parts.length; i < l; i++) {
      var part = parts[i];

      if (part === '..') {
        if (parentBase.length === 0) {
          throw new Error('Cannot access parent module of root');
        }
        parentBase.pop();
      } else if (part === '.') {
        continue;
      } else { parentBase.push(part); }
    }

    return parentBase.join('/');
  }

  requirejs.entries = requirejs._eak_seen = registry;
  requirejs.unsee = function(moduleName) {
    findModule(moduleName, '(unsee)').unsee();
  };

  requirejs.clear = function() {
    requirejs.entries = requirejs._eak_seen = registry = {};
    seen = {};
  };
})();

define('buy-button-sdk/adapters/checkout-adapter', ['exports', '../ajax', '../metal/core-object'], function (exports, _ajax, _metalCoreObject) {
  'use strict';

  var _slice = Array.prototype.slice;

  var CheckoutAdapter = _metalCoreObject['default'].extend(Object.defineProperties({
    ajax: _ajax['default'],

    constructor: function constructor(config) {
      this.config = config;
    },

    idKeyForType: function idKeyForType() {
      return 'token';
    },

    pathForType: function pathForType(type) {
      return '/' + type;
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

      var url = '' + this.baseUrl + this.pathForType(type) + '.json';
      var paramNames = Object.keys(query);

      if (paramNames.length > 0) {
        throw new Error('Querying checkouts is not allowed');
      }

      return url;
    },

    buildSingleUrl: function buildSingleUrl(type, id) {
      return '' + this.baseUrl + this.pathForType(type) + '/' + id + '.json';
    },

    fetchSingle: function fetchSingle() /* type, id */{
      var url = this.buildUrl.apply(this, ['single'].concat(_slice.call(arguments)));

      return this.ajax('GET', url, { headers: this.headers }).then(function (response) {
        return response.json;
      });
    },

    create: function create(type, payload) {
      var url = this.buildUrl('multiple', type);

      return this.ajax('POST', url, { headers: this.headers, body: JSON.stringify(payload) }).then(function (response) {
        return response.json;
      });
    },

    update: function update(type, id, payload) {
      var url = this.buildUrl('single', type, id);

      return this.ajax('PATCH', url, { headers: this.headers, body: JSON.stringify(payload) }).then(function (response) {
        return response.json;
      });
    }
  }, {
    base64ApiKey: {
      get: function get() {
        return btoa(this.config.apiKey);
      },
      configurable: true,
      enumerable: true
    },
    baseUrl: {
      get: function get() {
        var myShopifyDomain = this.config.myShopifyDomain;

        return 'https://' + myShopifyDomain + '.myshopify.com/anywhere';
      },
      configurable: true,
      enumerable: true
    },
    headers: {
      get: function get() {
        return {
          Authorization: 'Basic ' + this.base64ApiKey,
          'Content-Type': 'application/json'
        };
      },
      configurable: true,
      enumerable: true
    }
  }));

  exports['default'] = CheckoutAdapter;
});
define('buy-button-sdk/adapters/publication-adapter', ['exports', '../ajax', '../metal/core-object'], function (exports, _ajax, _metalCoreObject) {
  'use strict';

  var _slice = Array.prototype.slice;

  var PublicationAdapter = _metalCoreObject['default'].extend(Object.defineProperties({
    ajax: _ajax['default'],

    constructor: function constructor(config) {
      this.config = config;
    },

    idKeyForType: function idKeyForType(type) {
      return type.slice(0, -1) + '_ids';
    },

    pathForType: function pathForType(type) {
      return '/' + type.slice(0, -1) + '_publications.json';
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
          var value = undefined;

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
      var key = this.idKeyForType(type);
      var opts = {};

      opts[key] = [id];

      return this.buildMultipleUrl(type, opts);
    },

    fetchMultiple: function fetchMultiple() /* type, [query] */{
      var url = this.buildUrl.apply(this, ['multiple'].concat(_slice.call(arguments)));

      return this.ajax('GET', url, { headers: this.headers }).then(function (response) {
        return response.json;
      });
    },

    fetchSingle: function fetchSingle() /* type, id */{
      var url = this.buildUrl.apply(this, ['single'].concat(_slice.call(arguments)));

      return this.ajax('GET', url, { headers: this.headers }).then(function (response) {
        return response.json;
      });
    }
  }, {
    base64ApiKey: {
      get: function get() {
        return btoa(this.config.apiKey);
      },
      configurable: true,
      enumerable: true
    },
    baseUrl: {
      get: function get() {
        var _config = this.config;
        var myShopifyDomain = _config.myShopifyDomain;
        var channelId = _config.channelId;

        return 'https://' + myShopifyDomain + '.myshopify.com/api/channels/' + channelId;
      },
      configurable: true,
      enumerable: true
    },
    headers: {
      get: function get() {
        return {
          Authorization: 'Basic ' + this.base64ApiKey,
          'Content-Type': 'application/json'
        };
      },
      configurable: true,
      enumerable: true
    }
  }));

  exports['default'] = PublicationAdapter;
});
define("buy-button-sdk/ajax", ["exports"], function (exports) {
  "use strict";

  exports["default"] = ajax;
  function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return response;
    }

    var error = new Error(response.statusText);

    error.status = response.status;
    error.response = response;
    throw error;
  }

  function parseResponse(response) {
    return response.json().then(function (json) {
      return { json: json, originalResponse: response, isJSON: true };
    })["catch"](function () {
      var responseClone = response.clone();

      return responseClone.text().then(function (text) {
        return { text: text, originalResponse: responseClone, isText: true };
      });
    });
  }

  function ajax(method, url) {
    var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    opts.method = method;

    return fetch(url, opts).then(checkStatus).then(parseResponse);
  }
});
define('buy-button-sdk/config', ['exports', './metal/core-object'], function (exports, _metalCoreObject) {
  'use strict';

  /**
   * @module js-buy-sdk
   * @submodule config
   */

  var Config = _metalCoreObject['default'].extend({
    /**
     * @class Config
     * @constructor
     * @param {Object} attrs A hash of required config data.
     * @param {String} attrs.apiKey Your api client's public token
     * @param {String} attrs.channelId The channel from which to read
     * publications. Visit `<your-shops-domain>/admin/channels.json` while
     * authenticated to see a list of available channels.
     * @param {String} attrs.myShopifyDomain You shop's `myshopify.com` domain.
     */
    constructor: function constructor(attrs) {
      var _this = this;

      this.requiredProperties.forEach(function (key) {
        if (!attrs.hasOwnProperty(key)) {
          throw new Error('new Config() requires the option \'' + key + '\'');
        } else {
          _this[key] = attrs[key];
        }
      });
    },

    /**
     * The apiKey for authenticating against shopify. This is your api client's
     * public api token. Not the shared secret. Set during initialation.
     * @attribute requiredProperties
     * @default ['apiKey', 'channelId', 'myShopifyDomain']
     * @type Array
     * @private
     */
    requiredProperties: ['apiKey', 'channelId', 'myShopifyDomain'],

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
     * @attribute channelId
     * @default ''
     * @type String
     * @public
     */
    channelId: '',

    /**
     * @attribute myShopifyDomain
     * @default ''
     * @type String
     * @public
     */
    myShopifyDomain: ''
  });

  exports['default'] = Config;
});
define('buy-button-sdk/isomorphic-btoa', ['exports'], function (exports) {
  /* global global, require, Buffer */

  'use strict';

  var globalNamespace = undefined;

  if (typeof global === 'undefined') {
    globalNamespace = window;
  } else {
    globalNamespace = global;
  }

  var btoa = globalNamespace.btoa;

  function isNode() {
    var windowAbsent = typeof window === 'undefined';
    var requirePresent = typeof require === 'function';

    return windowAbsent && requirePresent;
  }

  if (!btoa && isNode()) {
    globalNamespace.btoa = function (string) {
      return new Buffer(string).toString('base64');
    };
  }
});
define('buy-button-sdk/isomorphic-fetch', ['exports'], function (exports) {
  /* global global, require */

  'use strict';

  var globalNamespace = undefined;

  if (typeof global === 'undefined') {
    globalNamespace = window;
  } else {
    globalNamespace = global;
  }

  var fetch = globalNamespace.fetch;

  function isNode() {
    var windowAbsent = typeof window === 'undefined';
    var requirePresent = typeof require === 'function';

    return windowAbsent && requirePresent;
  }

  if (!fetch && isNode()) {
    globalNamespace.fetch = require('node-fetch');
    globalNamespace.Response = globalNamespace.fetch.Response;
  }
});
define('buy-button-sdk/metal/assign', ['exports'], function (exports) {
  /* eslint no-undefined: 0 */

  'use strict';

  var assign = undefined;

  if (typeof Object.assign === 'function') {
    assign = Object.assign;
  } else {
    assign = function (target) {
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var output = Object(target);

      var propertyObjects = [].slice.call(arguments, 1);

      if (propertyObjects.length > 0) {
        propertyObjects.forEach(function (source) {
          if (source !== undefined && source !== null) {
            var nextKey = undefined;

            for (nextKey in source) {
              if (source.hasOwnProperty(nextKey)) {
                output[nextKey] = source[nextKey];
              }
            }
          }
        });
      }

      return output;
    };
  }

  exports['default'] = assign;
});
define('buy-button-sdk/metal/core-object', ['exports', './create-class'], function (exports, _createClass) {
  'use strict';

  var CoreObject = (0, _createClass['default'])({
    constructor: function constructor() {},

    'static': {
      extend: function extend(subClassProps) {
        return (0, _createClass['default'])(subClassProps, this);
      }
    }
  });

  exports['default'] = CoreObject;
});
define('buy-button-sdk/metal/create-class', ['exports', './assign', './includes'], function (exports, _assign, _includes) {
  'use strict';

  function wrap(func, superFunc) {
    function superWrapper() {
      var originalSuper = this['super'];

      this['super'] = function () {
        return superFunc.apply(this, arguments);
      };

      var ret = func.apply(this, arguments);

      this['super'] = originalSuper;

      return ret;
    }

    superWrapper.wrappedFunction = func;

    return superWrapper;
  }

  function defineProperties(names, proto, destination) {
    var parentProto = Object.getPrototypeOf(destination);

    names.forEach(function (name) {
      var descriptor = Object.getOwnPropertyDescriptor(proto, name);
      var parentDescriptor = parentProto.hasOwnProperty(name) && Object.getOwnPropertyDescriptor(parentProto, name);

      if (typeof parentDescriptor.value === 'function' && typeof descriptor.value === 'function') {
        var wrappedFunction = wrap(descriptor.value, parentDescriptor.value);

        Object.defineProperty(destination, name, { value: wrappedFunction });
      } else {
        Object.defineProperty(destination, name, descriptor);
      }
    });
  }

  function createClass(props) {
    var parent = arguments.length <= 1 || arguments[1] === undefined ? Object : arguments[1];

    var Constructor = wrap(props.constructor, parent);
    var instancePropertyNames = Object.getOwnPropertyNames(props).filter(function (key) {
      return !(0, _includes['default'])(['constructor', 'static'], key);
    });

    (0, _assign['default'])(Constructor, parent);

    Constructor.prototype = Object.create(parent.prototype);
    defineProperties(instancePropertyNames, props, Constructor.prototype);
    Constructor.prototype.constructor = Constructor;

    var staticProps = props['static'];

    if (staticProps) {
      var staticPropertyNames = Object.getOwnPropertyNames(staticProps);

      defineProperties(staticPropertyNames, staticProps, Constructor);
    }

    return Constructor;
  }

  exports['default'] = createClass;
});
define("buy-button-sdk/metal/includes", ["exports"], function (exports) {
  "use strict";

  var includes = undefined;

  if (!Array.prototype.includes) {
    includes = function (array, searchElement) {
      var ObjectifiedArray = Object(array);
      var length = parseInt(ObjectifiedArray.length, 10) || 0;

      if (length === 0) {
        return false;
      }

      var startIndex = parseInt(arguments[1], 10) || 0;
      var index = undefined;

      if (startIndex >= 0) {
        index = startIndex;
      } else {
        index = length + startIndex;

        if (index < 0) {
          index = 0;
        }
      }

      while (index < length) {
        var currentElement = ObjectifiedArray[index];

        /* eslint no-self-compare:0 */
        if (searchElement === currentElement || searchElement !== searchElement && currentElement !== currentElement) {
          // NaN !== NaN
          return true;
        }
        index++;
      }

      return false;
    };
  } else {
    includes = function (array) {
      var args = [].slice.call(arguments, 1);

      return Array.prototype.includes.apply(array, args);
    };
  }

  exports["default"] = includes;
});
define("buy-button-sdk/metal/uniq", ["exports"], function (exports) {
  "use strict";

  exports["default"] = function (array) {
    return array.reduce(function (uniqueArray, item) {
      if (uniqueArray.indexOf(item) < 0) {
        uniqueArray.push(item);
      }

      return uniqueArray;
    }, []);
  };
});
define('buy-button-sdk/models/base-model', ['exports', '../metal/core-object', '../metal/assign'], function (exports, _metalCoreObject, _metalAssign) {
  'use strict';

  var BaseModel = _metalCoreObject['default'].extend({
    constructor: function constructor() {
      var attrs = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var metaAttrs = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      this.attrs = attrs;

      (0, _metalAssign['default'])(this, metaAttrs);
    },
    attrs: null,
    serializer: null,
    adapter: null,
    shopClient: null
  });

  exports['default'] = BaseModel;
});
define('buy-button-sdk/models/checkout-model', ['exports', './base-model'], function (exports, _baseModel) {
  'use strict';

  var CartModel = _baseModel['default'].extend({
    constructor: function constructor() {
      this['super'].apply(this, arguments);
    }
  });

  exports['default'] = CartModel;
});
define('buy-button-sdk/models/product-model', ['exports', './base-model', '../metal/core-object', '../metal/uniq', '../metal/includes'], function (exports, _baseModel, _metalCoreObject, _metalUniq, _metalIncludes) {
  'use strict';

  var Option = _metalCoreObject['default'].extend(Object.defineProperties({
    constructor: function constructor(name, values) {
      this.name = name;
      this.values = values;
      this.selected = values[0];
    },

    name: '',

    values: []

  }, {
    selected: {
      get: function get() {
        return this._selected;
      },
      set: function set(value) {
        if ((0, _metalIncludes['default'])(this.values, value)) {
          this._selected = value;
        } else {
          throw new Error('Invalid option selection for ' + this.name + '.');
        }

        return value;
      },
      configurable: true,
      enumerable: true
    }
  }));

  var ProductModel = _baseModel['default'].extend(Object.defineProperties({
    constructor: function constructor() {
      this['super'].apply(this, arguments);
    }

  }, {
    memoized: {
      get: function get() {
        this._memoized = this._memoized || {};

        return this._memoized;
      },
      configurable: true,
      enumerable: true
    },
    options: {
      get: function get() {
        if (this.memoized.options) {
          return this.memoized.options;
        }

        var baseOptions = this.attrs.options;
        var variants = this.attrs.variants;

        this.memoized.options = baseOptions.map(function (option) {
          var name = option.name;

          var dupedValues = variants.reduce(function (valueList, variant) {
            var optionValueForOption = variant.option_values.filter(function (optionValue) {
              return optionValue.name === option.name;
            })[0];

            valueList.push(optionValueForOption.value);

            return valueList;
          }, []);

          var values = (0, _metalUniq['default'])(dupedValues);

          return new Option(name, values);
        });

        return this.memoized.options;
      },
      configurable: true,
      enumerable: true
    },
    selections: {
      get: function get() {
        return this.options.map(function (option) {
          return option.selected;
        });
      },
      configurable: true,
      enumerable: true
    },
    selectedVariant: {
      get: function get() {
        var variantTitle = this.selections.join(' / ');

        return this.attrs.variants.filter(function (variant) {
          return variant.title === variantTitle;
        })[0];
      },
      configurable: true,
      enumerable: true
    },
    selectedVariantImage: {
      get: function get() {
        var selectedVariantId = this.selectedVariant.id;
        var images = this.attrs.images;
        var primaryImage = images[0];
        var variantImage = images.filter(function (image) {
          return image.variant_ids.indexOf(selectedVariantId) !== -1;
        })[0];

        return variantImage || primaryImage;
      },
      configurable: true,
      enumerable: true
    }
  }));

  exports['default'] = ProductModel;
});
define("promise", ["exports"], function (exports) {
  "use strict";

  var RSVP = window.RSVP;
  var Promise = RSVP.Promise;

  exports.RSVP = RSVP;
  exports.Promise = Promise;
  exports["default"] = Promise;
});
define('buy-button-sdk/serializers/checkout-serializer', ['exports', '../metal/core-object', '../metal/assign', '../models/checkout-model'], function (exports, _metalCoreObject, _metalAssign, _modelsCheckoutModel) {
  'use strict';

  var CheckoutSerializer = _metalCoreObject['default'].extend({
    constructor: function constructor() {},

    rootKeyForType: function rootKeyForType(type) {
      return type.slice(0, -1);
    },

    modelForType: function modelForType() /* type */{
      return _modelsCheckoutModel['default'];
    },

    deserializeSingle: function deserializeSingle(type, singlePayload, metaAttrs) {
      var modelAttrs = singlePayload[this.rootKeyForType(type)];
      var model = this.modelFromAttrs(type, modelAttrs, metaAttrs);

      return model;
    },

    modelFromAttrs: function modelFromAttrs(type, attrs, metaAttrs) {
      var Model = this.modelForType(type);

      return new Model(attrs, metaAttrs);
    },

    serialize: function serialize(type, model) {
      var root = this.rootKeyForType(type);
      var payload = {};
      var attrs = (0, _metalAssign['default'])({}, model.attrs);

      payload[root] = attrs;

      delete attrs.attributes;

      Object.keys(attrs).forEach(function (key) {
        var value = attrs[key];

        if (value === null || typeof value === 'string' && value.length === 0) {
          delete attrs[key];
        }
      });

      return payload;
    }
  });

  exports['default'] = CheckoutSerializer;
});
define('buy-button-sdk/serializers/publication-serializer', ['exports', '../metal/core-object', '../models/base-model', '../models/product-model'], function (exports, _metalCoreObject, _modelsBaseModel, _modelsProductModel) {
  'use strict';

  var PublicationSerializer = _metalCoreObject['default'].extend({
    constructor: function constructor() {},

    rootKeyForType: function rootKeyForType(type) {
      return type.slice(0, -1) + '_publications';
    },

    models: {
      collections: _modelsBaseModel['default'],
      products: _modelsProductModel['default']
    },

    modelForType: function modelForType(type) {
      return this.models[type];
    },

    deserializeSingle: function deserializeSingle(type, singlePayload, metaAttrs) {
      var models = singlePayload[this.rootKeyForType(type)];
      var model = this.modelFromAttrs(type, models[0], metaAttrs);

      return model;
    },

    deserializeMultiple: function deserializeMultiple(type, collectionPayload, metaAttrs) {
      var _this = this;

      var models = collectionPayload[this.rootKeyForType(type)];

      return models.map(function (attrs) {
        var model = _this.modelFromAttrs(type, attrs, metaAttrs);

        return model;
      });
    },

    modelFromAttrs: function modelFromAttrs(type, attrs, metaAttrs) {
      var Model = this.modelForType(type);

      return new Model(attrs, metaAttrs);
    }
  });

  exports['default'] = PublicationSerializer;
});
define('buy-button-sdk/shop-client', ['exports', './serializers/publication-serializer', './adapters/publication-adapter', './serializers/checkout-serializer', './adapters/checkout-adapter', './metal/core-object', './metal/assign'], function (exports, _serializersPublicationSerializer, _adaptersPublicationAdapter, _serializersCheckoutSerializer, _adaptersCheckoutAdapter, _metalCoreObject, _metalAssign) {
  'use strict';

  var _slice = Array.prototype.slice;

  /**
   * @module js-buy-sdk
   * @submodule shop-client
   */

  function fetchFactory(fetchType, type) {
    var func = undefined;

    switch (fetchType) {
      case 'all':
        func = function () {
          return this.fetchAll(type);
        };
        break;
      case 'one':
        func = function () {
          return this.fetch.apply(this, [type].concat(_slice.call(arguments)));
        };
        break;
      case 'query':
        func = function () {
          return this.fetchQuery.apply(this, [type].concat(_slice.call(arguments)));
        };
        break;
    }

    return func;
  }

  var ShopClient = _metalCoreObject['default'].extend(Object.defineProperties({
    /**
     * @class ShopClient
     * @constructor
     * @param {Config} [config] Config data to be used throughout all API
     * interaction
     */
    constructor: function constructor(config) {
      this.config = config;

      this.serializers = {
        products: _serializersPublicationSerializer['default'],
        collections: _serializersPublicationSerializer['default'],
        checkouts: _serializersCheckoutSerializer['default']
      };

      this.adapters = {
        products: _adaptersPublicationAdapter['default'],
        collections: _adaptersPublicationAdapter['default'],
        checkouts: _adaptersCheckoutAdapter['default']
      };
    },

    config: null,

    /**
     * Fetch all of a `type`, returning a promise.
     *
     * ```javascript
     * client.fetchAll('products').then(products => {
     *   // do things with products
     * });
     * ```
     *
     * @method fetchAll
     * @public
     * @param {String} type The pluralized name of the type, in lower case.
     * @return {Promise|Array} a promise resolving with an array of `type`
     */
    fetchAll: function fetchAll(type) {
      var _this = this;

      var adapter = new this.adapters[type](this.config);

      return adapter.fetchMultiple(type).then(function (payload) {
        return _this.deserialize(type, payload, adapter, { multiple: true });
      });
    },

    /**
     * Fetch one of a `type`, returning a promise.
     *
     * ```javascript
     * client.fetch('products', 123).then(product => {
     *   // do things with the product
     * });
     * ```
     *
     * @method fetch
     * @public
     * @param {String} type The pluralized name of the type, in lower case.
     * @param {String|Number} id a unique identifier
     * @return {Promise|BaseModel} a promise resolving with a single instance of
     * `type` expressed as a `BaseModel`.
     */
    fetch: function fetch(type, id) {
      var _this2 = this;

      var adapter = new this.adapters[type](this.config);

      return adapter.fetchSingle(type, id).then(function (payload) {
        return _this2.deserialize(type, payload, adapter, { single: true });
      });
    },

    /**
     * Fetch many of a `type`, that match `query`
     *
     * ```javascript
     * client.fetchQuery('products', { collection_id: 456 }).then(products => {
     *   // do things with the products
     * });
     * ```
     *
     * @method fetchQuery
     * @public
     * @param {String} type The pluralized name of the type, in lower case.
     * @param {Object} query a query sent to the api server.
     * @return {Promise|Array} a promise resolving with an array of `type`.
     */
    fetchQuery: function fetchQuery(type, query) {
      var _this3 = this;

      var adapter = new this.adapters[type](this.config);

      return adapter.fetchMultiple(type, query).then(function (payload) {
        return _this3.deserialize(type, payload, adapter, { multiple: true });
      });
    },

    /**
     * Create an instance of `type`, optionally including `attrs`.
     *
     * ```javascript
     * client.create('checkouts', { line_items: [ ... ] }).then(checkout => {
     *   // do things with the checkout.
     * });
     * ```
     *
     * @method create
     * @public
     * @param {String} type The pluralized name of the type, in lower case.
     * @param {Object} [attrs={}] attributes to send to the server for creation.
     * @return {Promise|CartModel} a promise resolving with a single instance of
     * `type`
     */
    create: function create(type) {
      var _this4 = this;

      var attrs = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var adapter = new this.adapters[type](this.config);

      return adapter.create(type, attrs).then(function (payload) {
        return _this4.deserialize(type, payload, adapter, { single: true });
      });
    },

    /**
     * Create an instance of `type`, optionally including `attrs`.
     *
     * ```javascript
     * client.create('checkouts', { line_items: [ ... ] }).then(checkout => {
     *   // do things with the checkout.
     * });
     * ```
     *
     * @method update
     * @public
     * @param {String} type The pluralized name of the type, in lower case.
     * @param {BaseModel} updatedModel The model that represents new state to
     * to persist to the server.
     * @return {Promise|CartModel} a promise resolving with a single instance of
     * `type`
     */
    update: function update(type, updatedModel) {
      var _this5 = this;

      var adapter = updatedModel.adapter;
      var serializer = updatedModel.serializer;
      var serializedModel = serializer.serialize(type, updatedModel);
      var id = updatedModel.attrs[adapter.idKeyForType(type)];

      return adapter.update(type, id, serializedModel).then(function (payload) {
        var meta = { shopClient: _this5, adapter: adapter, serializer: serializer, type: type };

        return serializer.deserializeSingle(type, payload, meta);
      });
    },

    /**
     * Proxy to serializer's deserialize.
     *
     * @method deserialize
     * @private
     * @param {String} type The pluralized name of the type, in lower case.
     * @param {Object} payload The raw payload returned by the adapter.
     * @param {BaseAdapter} adapter The adapter that yielded the payload.
     * @param {Object} opts Options that determine which deserialization method to
     * use.
     * @param {Boolean} opts.multiple true when the payload represents multiple
     * models
     * @param {Boolean} opts.single true when the payload represents one model.
     * @return {BaseModel} an instance of `type` reified into a model.
     */
    deserialize: function deserialize(type, payload, adapter) {
      var opts = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

      var serializer = new this.serializers[type](this.config);
      var meta = { shopClient: this, adapter: adapter, serializer: serializer, type: type };
      var serializedPayload = undefined;

      if (opts.multiple) {
        serializedPayload = serializer.deserializeMultiple(type, payload, meta);
      } else {
        serializedPayload = serializer.deserializeSingle(type, payload, meta);
      }

      return serializedPayload;
    },

    /**
     * Convenience wrapper for {{#crossLink "ShopClient/fetchAll:method"}}
     * {{/crossLink}}. Equivalent to:
     *
     * ```javascript
     * client.fetchAll('products');
     * ```
     *
     * @method fetchAllProducts
     * @public
     * @return {Promise|Array} The product models.
     */
    fetchAllProducts: fetchFactory('all', 'products'),

    /**
     * Convenience wrapper for {{#crossLink "ShopClient/fetchAll:method"}}
     * {{/crossLink}}. Equivalent to:
     *
     * ```javascript
     * client.fetchAll('collections');
     * ```
     *
     * @method fetchAllCollections
     * @public
     * @return {Promise|Array} The collection models.
     */
    fetchAllCollections: fetchFactory('all', 'collections'),

    /**
     * Convenience wrapper for {{#crossLink "ShopClient/fetch:method"}}
     * {{/crossLink}}. Equivalent to:
     *
     * ```javascript
     * client.fetch('products', 123);
     * ```
     *
     * @method fetchProduct
     * @public
     * @param {String|Number} id a unique identifier
     * @return {Promise|BaseModel} The product model.
     */
    fetchProduct: fetchFactory('one', 'products'),

    /**
     * Convenience wrapper for {{#crossLink "ShopClient/fetch:method"}}
     * {{/crossLink}}. Equivalent to:
     *
     * ```javascript
     * client.fetch('collections', 123);
     * ```
     *
     * @method fetchCollection
     * @public
     * @param {String|Number} id a unique identifier
     * @return {Promise|BaseModel} The collection model.
     */
    fetchCollection: fetchFactory('one', 'collections'),

    /**
     * Convenience wrapper for {{#crossLink "ShopClient/fetchQuery:method"}}
     * {{/crossLink}}. Equivalent to:
     *
     * ```javascript
     * client.fetchQuery('products', { query: 'options' });
     * ```
     *
     * @method fetchQueryProducts
     * @public
     * @param {Object} query a query sent to the api server.
     * @return {Promise|Array} The product models.
     */
    fetchQueryProducts: fetchFactory('query', 'products'),

    /**
     * Convenience wrapper for {{#crossLink "ShopClient/fetchQuery:method"}}
     * {{/crossLink}}. Equivalent to:
     *
     * ```javascript
     * client.fetchQuery('collections', { query: 'options' });
     * ```
     *
     * @method fetchQueryCollections
     * @public
     * @param {Object} query a query sent to the api server.
     * @return {Promise|Array} The collection models.
     */
    fetchQueryCollections: fetchFactory('query', 'collections')
  }, {
    serializers: { // Prevent leaky state

      get: function get() {
        return (0, _metalAssign['default'])({}, this.shadowedSerializers);
      },
      set: function set(values) {
        this.shadowedSerializers = (0, _metalAssign['default'])({}, values);
      },
      configurable: true,
      enumerable: true
    },
    adapters: {
      get: function get() {
        return (0, _metalAssign['default'])({}, this.shadowedAdapters);
      },
      set: function set(values) {
        this.shadowedAdapters = (0, _metalAssign['default'])({}, values);
      },
      configurable: true,
      enumerable: true
    }
  }));

  exports['default'] = ShopClient;
});
define('buy-button-sdk/shopify', ['exports', './config', './shop-client', './isomorphic-fetch', './isomorphic-btoa'], function (exports, _config, _shopClient, _isomorphicFetch, _isomorphicBtoa) {
  'use strict';

  /**
   * @module js-buy-sdk
   * @submodule shopify
   */

  /**
   * This namespace contains all globally accessible classes
   * @class ShopifyBuy
   * @static
   */
  var Shopify = {
    ShopClient: _shopClient['default'],
    Config: _config['default'],

    /**
     * Create a ShopClient. This is the main entry point to the SDK.
     *
     * ```javascript
     * const client = ShopifyBuy.buildClient({
     *   apiKey: 'abc123',
     *   channelId: 123456,
     *   myShopifyDomain: 'myshop'
     * });
     * ```
     *
     * @method buildClient
     * @for ShopifyBuy
     * @static
     * @public
     * @param {Object} configAttrs A hash of required config data.
     * @param {String} configAttrs.apiKey Your api client's public token.
     * @param {String} configAttrs.channelId The channel from which to read
     * publications. Visit `<your-shops-domain>/admin/channels.json` while
     * authenticated to see a list of available channels.
     * @param {String} configAttrs.myShopifyDomain You shop's `myshopify.com`
     * domain.
     * @return {ShopClient} a client for the shop using your api credentials.
     */
    buildClient: function buildClient() {
      var configAttrs = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var config = new this.Config(configAttrs);

      return new this.ShopClient(config);
    }
  };

  exports['default'] = Shopify;
});
window.ShopifyBuy = require('buy-button-sdk/shopify').default;
    }());
//# sourceMappingURL=buy-button-sdk.globals.map