'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _global = require('./metal/global');

var _global2 = _interopRequireDefault(_global);

var _coreObject = require('./metal/core-object');

var _coreObject2 = _interopRequireDefault(_coreObject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Store = _coreObject2.default.extend({
  constructor: function constructor() {
    this.localStorageAvailable = this.storageAvailable('localStorage');
    this.cache = {};
  },
  setItem: function setItem(key, value) {
    if (this.localStorageAvailable) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      this.cache[key] = value;
    }

    return value;
  },
  getItem: function getItem(key) {
    if (this.localStorageAvailable) {
      var stringValue = localStorage.getItem(key);

      try {
        return JSON.parse(stringValue);
      } catch (e) {
        return null;
      }
    } else {
      return this.cache[key] || null;
    }
  },
  storageAvailable: function storageAvailable(type) {
    try {
      var storage = _global2.default[type];
      var x = '__storage_test__';

      storage.setItem(x, x);
      storage.removeItem(x);

      return true;
    } catch (e) {
      return false;
    }
  }
});

exports.default = Store;