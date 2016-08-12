/**
 * This script bundles some scripts used for testing:
 * - amd loader
 * - polyfills
 *   + fetch
 *   + promises
 *   + bace64 encoding
 * - then deps for the testing framework
 */
const fs = require('fs');

const sourceModules = getSourceFromModules([
  // umd module loader
  'loader.js',
  // original testing sdk deps
  'route-recognizer',
  'fake-xml-http-request',
  'pretender'
]);

const outSource = `
${sourceModules[0]}
(function (self) {
;self.fetch = null;
${sourceModules.slice(1).join('\n')}
}(window));
`;

console.log(outSource);

function getSourceFromModules(modules) {

  return modules
  .map((nameModule) => {
    const pathModule = require.resolve(nameModule);

    return fs.readFileSync(pathModule, 'utf8');
  });
}