const path = require('path');
const fs = require('fs');
const gitTag = require('git-rev').tag;
const gitCommit = require('git-rev').short;

gitTag(function (tag) {
  gitCommit(function (commit) {
    const pathSource = path.join(process.cwd(), process.argv[ 2 ]);
    const pathLicense = path.join(process.cwd(), 'LICENSE.txt');

    const source = fs.readFileSync(pathSource, 'utf8');
    const license = fs.readFileSync(pathLicense, 'utf8');

    const version = `${tag}-${commit}`;

    const header = `/*\n${license}\n*/\n\n/* version: ${version} */`;

    fs.writeFileSync(pathSource, `${header}\n\n${source}`);
  });
});
