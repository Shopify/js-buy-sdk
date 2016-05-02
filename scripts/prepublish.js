#!/usr/bin/env node

/* globals require process */

// require('./build');

require('./util/work-from-root')();

var fileExists = require('./util/file-exists');
var recursiveRmdir = require('./util/recursive-rmdir');
var recursiveCpdir = require('./util/recursive-cpdir');
var path = require('path');

var libDir = 'lib';

if (fileExists(libDir)) {
  recursiveRmdir(libDir);
}

var srcDir = path.join(process.cwd(), 'dist', 'node-lib');
var destDir = path.join(process.cwd(), 'lib');

recursiveCpdir(srcDir, destDir);
