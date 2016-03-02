/* global global, require */

const globalNamespace = global || window;

const fetch = globalNamespace.fetch;

if (!fetch && !window && require) {
  globalNamespace.fetch = require('node-fetch');
  globalNamespace.Response = globalNamespace.fetch.Response;
}
