/**
 * This script bundles some scripts used for testing
 */
const fs = require('fs');

const sourceModules = getSourceFromModules([
  'route-recognizer',
  'fake-xml-http-request',
  'pretender'
]);

const outSource = `;window.fetch = null;
${sourceModules.join('\n')}
`;

console.log(outSource);

function getSourceFromModules(modules) {

  return modules
  .map((nameModule) => {
    const pathModule = require.resolve(nameModule);

    return fs.readFileSync(pathModule, 'utf8');
  });
}