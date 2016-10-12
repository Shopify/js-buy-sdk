/* global global */

let globalNamespace;

if (typeof global === 'undefined') {
  globalNamespace = window;
} else {
  globalNamespace = global;
}

function set(key, value) {
  if (!globalNamespace[key]) {
    globalNamespace[key] = value;
  }
}

function get(key) {
  return globalNamespace[key];
}

export default { set, get };
