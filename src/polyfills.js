import 'whatwg-fetch/fetch.js';
import promisePoly from 'core-js/fn/promise';
import base64 from 'Base64/base64.js';
import scope, { add } from './metal/global';

// drop in polyfills from base64
add('btoa', base64.btoa);
add('atob', base64.atob);

// drop in polyfills from Promise
add('Promise', promisePoly);
