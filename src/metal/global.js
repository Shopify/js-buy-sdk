/* global global */

let globalNamespace;

if (typeof global === 'undefined') {
  globalNamespace = window;
} else {
  globalNamespace = global;
}

export default globalNamespace;
