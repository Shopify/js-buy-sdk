/* eslint-env node */
const fetch = require('node-fetch');
const watcher = require('./watcher');
const rollupTests = require('./rollup-tests');
const parseBuildArgs = require('./parse-build-args');
const livereloadPort = require('../package.json').livereloadPort;

let bundle;

const {dest, withDependencyTracking} = parseBuildArgs();
const reloadUri = `http://localhost:${livereloadPort}/changed?files=tests.js,index.html`;

function notifyReload() {
  fetch(reloadUri);
}

watcher([['src', 'js'], ['test', 'js'], ['src/graphql', 'graphql']], () => {
  const start = Date.now();

  rollupTests({dest, withDependencyTracking, cache: bundle, browser: true}).then((newBundle) => {
    notifyReload();
    watcher.logInfo(`rebuilt bundle in ${Date.now() - start}ms`);

    bundle = newBundle;
  }).catch((error) => {
    watcher.logInfo(`Error during build ${error}`);
  });
});
