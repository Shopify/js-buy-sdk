'use strict';

const path = require('path');
const fs = require('fs');

const getVersion = require('./getVersion');

getVersion((err, version) => {
  if(err) {
    throw err;
  }

  const pathSource = path.join(process.cwd(), process.argv[ 2 ]);
  const pathLicense = path.join(process.cwd(), 'LICENSE.txt');

  const license = fs.readFileSync(pathLicense, 'utf8');
  const header = `/*\n${license}\n*/\n\n/* version: ${version} */`;

  let source = fs.readFileSync(pathSource, 'utf8');

  // this is not nice to do here but it's quick and dirty
  // within the source of the app theres a string like
  // {{versionString}}
  // we want to replace that with the generated version
  source = source.replace('{{versionString}}', version);

  fs.writeFileSync(pathSource, `${header}\n\n${source}`);
});