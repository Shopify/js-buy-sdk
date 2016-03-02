/* global global, require */

const globalNamespace = global || window;

let fetch = globalNamespace.fetch;
let Response = globalNamespace.Response;

if (!fetch && !window && require) {
  fetch = require('node-fetch');
  Response = fetch.Response;
}

export { Response };
export default fetch;
