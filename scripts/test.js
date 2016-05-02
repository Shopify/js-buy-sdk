#!/usr/bin/env node

/* globals require process */

require('./util/work-from-root')();

var followProcess = require('./util/follow-process');
var binPath = require('./util/node-module-bin-path');
var fileExists = require('./util/file-exists');
var recursiveRmdir = require('./util/recursive-rmdir');

var testBuildPath = '.dist-test';

if (fileExists(testBuildPath)) {
  recursiveRmdir(testBuildPath);
}

followProcess('node', [binPath('broccoli'), 'build', testBuildPath], function (buildStatus) {
  if (buildStatus === 0) {
    followProcess('node', [binPath('testem'), 'ci'], function (testStatus) {
      process.exit(testStatus);
    });
  } else {
    process.exit(buildStatus);
  }
});
