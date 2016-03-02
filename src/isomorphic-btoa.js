/* global global, require, Buffer */

const globalNamespace = global || window;

const btoa = globalNamespace.btoa;

function isNode() {
  const windowAbsent = typeof window === 'undefined';
  const requirePresent = typeof require === 'function';

  return windowAbsent && requirePresent;
}

if (!btoa && isNode()) {
  globalNamespace.btoa = function (string) {
    return (new Buffer(string)).toString('base64');
  };
}
