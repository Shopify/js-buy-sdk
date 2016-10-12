import 'whatwg-fetch/fetch.js';
import promisePoly from 'core-js/fn/promise';
import base64 from 'Base64/base64.js';
import globalVars from './metal/global-vars';

// drop in polyfills from base64
globalVars.set('btoa', base64.btoa);
globalVars.set('atob', base64.atob);

// drop in polyfills from Promise
globalVars.set('Promise', promisePoly);
