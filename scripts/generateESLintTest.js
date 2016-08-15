const CLIEngine = require('eslint').CLIEngine;
const glob = require('glob');
const jsStringEscape = require('js-string-escape');
const path = require('path');

const paths = glob.sync('src/**/*.js');

const engine = new CLIEngine();
const results = engine.executeOnFiles(paths).results;

const header = `import { module, test } from 'qunit'`;
const source = `${header}

test('ESLint', function(assert) {
${results.map(generateAssert).join('\n')}
});
`;

console.log(source);


function generateAssert(lint) {
  const relativePath = path.relative('src', lint.filePath);
  const errors = lint.messages;

  return ` assert.ok(${lint.errorCount === 0}, '${relativePath} should pass ESLint. ${jsStringEscape(renderErrors(errors))}');`
}

function renderErrors(errors) {
  if (!errors) {
    return '';
  }

  return errors.map(function (error) {
    return `${error.line}:${error.column} - ${error.message} (${error.ruleId})`;
  }).join('\n');
}
