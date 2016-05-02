#!/usr/bin/env node

/* globals require process */

require('./util/work-from-root')();

var followProcess = require('./util/follow-process');
var binPath = require('./util/node-module-bin-path');
var fileExists = require('./util/file-exists');
var recursiveRmdir = require('./util/recursive-rmdir');

var buildPath = 'dist';

process.env.BROCCOLI_ENV = 'production';

if (fileExists(buildPath)) {
  recursiveRmdir(buildPath);
}

followProcess('node', [binPath('broccoli'), 'build', buildPath], function (buildStatus) {
  process.exit(buildStatus);
});
