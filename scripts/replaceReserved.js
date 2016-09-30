var fs = require('fs');
var path = require('path');

const filePath = path.join(process.cwd(), process.argv[2]);
const replaceWords = [
  ['default', '_default']
];

process.stderr.write('Start replacing reserved syntax');

try {
  var contents = fs.readFileSync(filePath, 'utf8');

  replaceWords.forEach(function(replaceArgs) {
    contents = contents.split(replaceArgs[0]).join(replaceArgs[1]);
  });

  // output contents of replaced file
  console.log(contents);

  process.stderr.write('Finished replacing reserved syntax');
} catch(e) {
  process.stderr.write('Fail replacing reserved syntax');
}
