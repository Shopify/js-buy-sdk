const path = require('path');
const fs = require('fs');

const getVersion = require('./getVersion');

getVersion((version) => {
  const pathSource = path.join(process.cwd(), process.argv[ 2 ]);
  const pathLicense = path.join(process.cwd(), 'LICENSE.txt');

  const source = fs.readFileSync(pathSource, 'utf8');
  const license = fs.readFileSync(pathLicense, 'utf8');

  const header = `/*\n${license}\n*/\n\n/* version: ${version} */`;

  fs.writeFileSync(pathSource, `${header}\n\n${source}`);
});