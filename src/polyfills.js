import promisePoly from 'core-js/fn/promise';
import 'whatwg-fetch/fetch.js';
import 'Base64/base64.js';
import scope from './metal/global';

// write polyfills to global scope
if (!scope.Promise) {
  scope.Promise = promisePoly;
}
