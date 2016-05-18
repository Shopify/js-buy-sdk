/* global require, module */

const concat = require('broccoli-concat');
const mergeTrees = require('broccoli-merge-trees');
const treeFromPackage = require('./util/tree-from-package');


module.exports = function (/* env */) {
  const fetchPolyfill = treeFromPackage('whatwg-fetch', ['fetch.js']);
  const rsvp = treeFromPackage('rsvp', ['rsvp.js']);
  const base64Polyfill = treeFromPackage('Base64', ['base64.js']);

  const rsvpPolyfill = concat(rsvp, {
    header: ';(function (self) {',
    inputFiles: ['rsvp.js'],
    footer: `if (self.Promise === undefined) {
  self.Promise = RSVP.Promise;
}}(window));`,
    outputFile: 'promise.js'
  });

  return concat(mergeTrees([fetchPolyfill, rsvpPolyfill, base64Polyfill]), {
    inputFiles: ['fetch.js', 'promise.js', 'base64.js'],
    outputFile: 'polyfills.js'
  });
};
