/* eslint-env node */
const {createFilter} = require('rollup-pluginutils');
const {statSync} = require('fs');
const testGenerator = require('eslint-test-generator').default;
const {walkSync} = require('fs-extra');

function lint(lintFile) {
  return testGenerator({
    template: `{{#each results}}
  test('{{file}} should lint', () => {
    assert.ok({{lintOK}}, '{{message}}');
  })

  {{/each}}`,
    paths: [lintFile],
    maxWarnings: 0
  });
}


function getNewLints(files, cache) {
  return files.reduce((results, fileName) => {
    const cachedResult = cache[fileName];
    const mtime = statSync(fileName).mtime.toString();

    if (cachedResult && cachedResult.mtime === mtime) {
      return results;
    }

    results[fileName] = {
      lint: lint(fileName),
      mtime
    };

    return results;
  }, {});
}

function generateLintBundle(lints) {
  const lintTests = Object.keys(lints).sort().map((fileName) => {
    return lints[fileName].lint;
  }).join('\n');

  return `import assert from 'assert';
suite('lint-tests', function() {
${lintTests}
});`;
}

const lintResultCache = {};

module.exports = function(options = {}) {
  const filter = createFilter(options.include, options.exclude);
  const files = options.paths
    .reduce((fileAcc, lintPath) => fileAcc.concat(walkSync(lintPath)), [])
    .filter((file) => file.endsWith('.js'))
    .filter((file) => filter(file));

  return {
    name: 'lint-tests',

    load(id) {
      if (id === '/lint-tests.js') {
        const newLints = getNewLints(files, lintResultCache);

        Object.assign(lintResultCache, newLints);

        return generateLintBundle(lintResultCache);
      }

      return null;
    },

    resolveId(importee) {
      if (importee === 'lint-tests') {
        return '/lint-tests.js';
      }

      return null;
    }
  };
};
