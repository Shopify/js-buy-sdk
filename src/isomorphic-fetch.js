/* global global, require */

const globalNamespace = global || window;

const fetch = globalNamespace.fetch;

function isNode() {
  const windowAbsent = typeof window === 'undefined';
  const requirePresent = typeof require === 'function';

  return windowAbsent && requirePresent;
}

if (!fetch && isNode()) {
  globalNamespace.fetch = require('node-fetch');
  globalNamespace.Response = globalNamespace.fetch.Response;
}
