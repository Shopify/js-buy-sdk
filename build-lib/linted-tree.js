/* global require, module */

const esLint = require('broccoli-lint-eslint');
const jsStringEscape = require('js-string-escape');
const path = require('path');

function renderErrors(errors) {
  if (!errors) {
    return '';
  }

  return errors.map(function (error) {
    return `${error.line}:${error.column} - ${error.message} (${error.ruleId})`;
  }).join('\n');
}

module.exports = function (basePath) {
  return esLint(basePath, {
    testGenerator: function (relativePath, errors) {
      const pass = !errors || errors.length === 0;

      return `import { module, test } from 'qunit';
        module('ESLint - ${basePath}/${path.dirname(relativePath)}');
        test('${relativePath} should pass ESLint', function(assert) {
          assert.ok(${pass}, '${relativePath} should pass ESLint. ${jsStringEscape(renderErrors(errors))}');
        });
      `;
    }
  });
};
