// import promisePoly from 'rsvp/lib/rsvp.js';
import promisePoly from 'core-js/fn/promise';
import 'whatwg-fetch/fetch.js';
import 'Base64/base64.js';

let scope;

// check if we're running in an eco-system that uses window
// if it doesnt exist use global
if(typeof window !== 'undefined') {
  scope = window;
} else {
  scope = global;
}

// write polyfills to global scope
if(scope.Promise === undefined) {
  scope.Promise = promisePoly;
}