'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ajax;

var _ie9Ajax = require('./ie9-ajax');

var _ie9Ajax2 = _interopRequireDefault(_ie9Ajax);

var _global = require('./metal/global');

var _global2 = _interopRequireDefault(_global);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
  }).catch(function () {
    var responseClone = response.clone();

    return responseClone.text().then(function (text) {
      return { text: text, originalResponse: responseClone, isText: true };
    });
  });
}

function ajax(method, url) {
  var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  if (_global2.default.XDomainRequest) {
    return _ie9Ajax2.default.apply(undefined, arguments);
  }

  opts.method = method;
  opts.mode = 'cors';

  return fetch(url, opts).then(checkStatus).then(parseResponse);
}