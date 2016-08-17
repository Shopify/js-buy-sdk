'use strict';

/**
 * This script exists here because you cannot set BABEL_ENV while piping
 * data to the babel-cli. So this script is able to accept data being piped
 * in and also set BABEL_ENV. If no data is piped in then it is expected that
 * the second argument passed to this script will be the src to be run through
 * babel.
 */

const babel = require('babel-core');
const getStdin = require('get-stdin');
const path = require('path');

// set the environment variable on which babel should run
process.env.BABEL_ENV = process.env.BABEL_ENV || process.argv[2];

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
      extends: path.join(process.cwd(), '.babelrc')
    }).code;
  } else {
    const source = process.argv[3];
    
    if(source === undefined) {
      throw new Error('since nothing was piped to runBabel.js it\'s expected that babels source will be the 2nd parameter');
    }

    code = babel.transformFileSync(source, {
      extends: path.join(process.cwd(), '.babelrc')
    }).code;
  }

  // output to stdout so that we can
  // easily modify the output/output location via cli
  console.log(code);
});
