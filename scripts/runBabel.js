'use strict';

const babel = require('babel-core');
const getStdin = require('get-stdin');

// set the environment variable on which babel should run
process.env.BABEL_ENV = process.env.BABEL_ENV || process.argv[ 2 ];

// check that BABEL_ENV was set
if(process.env.BABEL_ENV === undefined) {
  throw new Error('BABEL_ENV is not set. This can be set either by passing in a value to runBabel.js or set via command line');
}

// read in data piped to this done app
getStdin()
.then(input => {
  let code;

  if(input !== '') {
    // run babel on the piped in data
    code = babel.transform(input, {
      extends: process.cwd() + '/' + '.babelrc'
    }).code;
  } else {
    const source = process.argv[ 3 ];
    
    if(source === undefined) {
      throw new Error('since nothing was piped to runBabel.js it\'s expected that babels source will be the 2nd parameter');
    }

    code = babel.transformFileSync(source, {
      extends: process.cwd() + '/' + '.babelrc'
    }).code;
  }

  // output to stdin
  console.log(code);
});