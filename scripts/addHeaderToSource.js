'use strict';

/**
 * The purpose of this build script is to take a file on disk and to add a header to it.
 * This header contains the license and a version number which corresponds to the latest 
 * git tag and commit.
 */

const path = require('path');
const fs = require('fs');
const getStdin = require('get-stdin');


getStdin()
.then(source => {
  const templateVersion = require('./util/templateVersion');
  const VERSION_TEMPLATE_STRING = require('./util/versionTemplateString');

  const pathLicense = path.join(process.cwd(), 'LICENSE.txt');

  const license = fs.readFileSync(pathLicense, 'utf8');
  const header = `/*\n${license}\n*/\n\n/* version: ${VERSION_TEMPLATE_STRING} */`;

  // add in the header to the source
  source = `${header}\n\n${source}`;

  // now drop in the current version
  templateVersion(source, (err, sourceVersioned) => {
    // write the templated js file to disk
    console.log(sourceVersioned);
  });
});
