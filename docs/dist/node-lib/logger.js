'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.wrapConsole = undefined;

var _coreObject = require('./metal/core-object');

var _coreObject2 = _interopRequireDefault(_coreObject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function wrapConsole(logCommand) {
  var logMethod = function logMethod() {
    /* eslint-disable no-console */
    if (console[logCommand]) {
      var _console;

      (_console = console)[logCommand].apply(_console, arguments);
    } else {
      var _console2;

      (_console2 = console).log.apply(_console2, arguments);
    }
    /* eslint-enable no-console */
  };

  return function () {
    var args = [].concat(Array.prototype.slice.call(arguments));

    args.unshift('[JS-BUY-SDK]: ');
    logMethod.apply(undefined, _toConsumableArray(args));
  };
}

var Logger = _coreObject2.default.extend({
  /**
   * Wrapper around the console log so in the future we can have better dev output.
   * Also allows us to disable output in production.
   * @class Logger
   * @constructor
   */
  constructor: function constructor() {},

  debug: wrapConsole('debug'),
  info: wrapConsole('info'),
  warn: wrapConsole('warn'),
  error: wrapConsole('error')
});

exports.wrapConsole = wrapConsole;
exports.default = new Logger();