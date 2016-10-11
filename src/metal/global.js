/* global global */

let globalNamespace;

if (typeof global === 'undefined') {
  globalNamespace = window;
} else {
  globalNamespace = global;
}

function add(key, value) {
  if (!globalNamespace[key]) {
    globalNamespace[key] = value;
  }
}

export default globalNamespace;
export { add };
