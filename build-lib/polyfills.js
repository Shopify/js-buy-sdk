/* global require, module */

const concat = require('broccoli-concat');
const mergeTrees = require('broccoli-merge-trees');
const treeFromPackage = require('./util/tree-from-package');


module.exports = function (/* env */) {
  const fetchPolyfill = treeFromPackage('whatwg-fetch', ['fetch.js']);
  const rsvp = treeFromPackage('rsvp', ['rsvp.js']);

  const rsvpPolyfill = concat(rsvp, {
    header: ';(function (self) {',
    inputFiles: ['rsvp.js'],
    footer: `if (self.Promise === undefined) {
      self.Promise = RSVP.Promise;
    }}(window));`,
    outputFile: 'promise.js'
  });

  return concat(mergeTrees([fetchPolyfill, rsvpPolyfill]), {
    inputFiles: ['fetch.js', 'promise.js'],
    outputFile: 'polyfills.js'
  });
};
