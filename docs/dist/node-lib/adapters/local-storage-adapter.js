'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _coreObject = require('../metal/core-object');

var _coreObject2 = _interopRequireDefault(_coreObject);

var _setGuidFor = require('../metal/set-guid-for');

var _setGuidFor2 = _interopRequireDefault(_setGuidFor);

var _store = require('../store');

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LocalStorageAdapter = _coreObject2.default.extend({
  constructor: function constructor() {
    this.store = new _store2.default();
  },
  idKeyForType: function idKeyForType() /* type */{
    return _setGuidFor.GUID_KEY;
  },
  fetchSingle: function fetchSingle(type, id) {
    var _this = this;

    return new Promise(function (resolve, reject) {
      var value = _this.store.getItem(_this.storageKey(type, id));

      if (value === null) {
        reject(new Error(type + '#' + id + ' not found'));

        return;
      }

      resolve(value);
    });
  },
  create: function create(type, payload) {
    var _this2 = this;

    return new Promise(function (resolve) {
      var id = _this2.identify(payload);

      _this2.store.setItem(_this2.storageKey(type, id), payload);
      resolve(payload);
    });
  },
  update: function update(type, id, payload) {
    var _this3 = this;

    return new Promise(function (resolve) {
      _this3.store.setItem(_this3.storageKey(type, id), payload);
      resolve(payload);
    });
  },
  storageKey: function storageKey(type, id) {
    return type + '.' + id;
  },
  identify: function identify(payload) {
    var keys = Object.keys(payload);

    if (keys.length === 1 && _typeof(payload[keys[0]]) === 'object') {
      return (0, _setGuidFor2.default)(payload[keys[0]]);
    }

    return (0, _setGuidFor2.default)(payload);
  }
});

exports.default = LocalStorageAdapter;