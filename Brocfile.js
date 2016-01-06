/* global require, module */

const mergeTrees = require('broccoli-merge-trees');

const vendor = require('./build-lib/vendor');
const lib = require('./build-lib/lib');
const tests = require('./build-lib/tests');

module.exports = mergeTrees([vendor, lib, tests]);

/*
const Watcher = require('broccoli/lib/watcher');
const broccoli = require('broccoli');

const builder = new broccoli.Builder(fullTree);
const watcher = new Watcher(builder);

watcher.on('change', () => {
  setTimeout(() => {
    console.log('\nCrazy Town\n');
  }, 0);
});
*/
