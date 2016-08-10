'use strict';

/**
 * The purpose of this build script is to take a file on disk and template in the version
 * number of the current build. The version of the current build is the latest git tag and commit
 */

const path = require('path');
const fs = require('fs');
const templateVersion = require('./util/templateVersion');
const VERSION_TEMPLATE_STRING = require('./util/versionTemplateString');

const pathSource = path.join(process.cwd(), process.argv[ 2 ]);

let source = fs.readFileSync(pathSource, 'utf8');

// now drop in the current version
templateVersion(source, (err, sourceVersioned) => {
  // write the templated js file to disk
  fs.writeFileSync(pathSource, sourceVersioned);
});
