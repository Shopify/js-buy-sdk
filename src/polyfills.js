import 'whatwg-fetch/fetch.js';
import promisePoly from 'core-js/fn/promise';
import base64 from 'Base64/base64.js';
import scope from './metal/global';

// drop in polyfills from base64
if (!scope.btoa) {
  scope.btoa = base64.btoa;
}

if (!scope.atob) {
  scope.atob = base64.atob;
}

// drop in polyfills from Promise
if (!scope.Promise) {
  scope.Promise = promisePoly;
}
