#!/usr/bin/env node

/* globals global */

'use strict';

const rootDirectory = `${__dirname}/../`;
const tests = {};
const Module = require('module');
const originalRequire = Module.prototype.require;

global.QUnit = require('qunitjs');
global.localStorage = require('node-localstorage').LocalStorage(`${rootDirectory}tmp`);

// used in promise shim
global.RSVP = require('rsvp');

// used by pretender
global.self = {
  RouteRecognizer: require('route-recognizer'),
  FakeXMLHttpRequest: require('fake-xml-http-request')
};

let path = require('path');
let fs = require('fs');
let index = 1;
let tapMessage = '';

Module.prototype.require = function () {
  const namespace = {
    src: { prefixes: ['shopify-buy'], isRequired:false, dirName: 'src'},
    tests: { prefixes: ['shopify-buy/tests'], isRequired:false, dirName: 'tests'},
    shims: { prefixes: ['qunit', 'promise'], isRequired:false, dirName: './'},
  };
  const libDirName = 'node-lib';
  const requiredPackage = arguments[0];

  namespace.src.isRequired = requiredPackage.indexOf(namespace.src.prefixes[0]) === 0;
  namespace.tests.isRequired = requiredPackage.indexOf(namespace.tests.prefixes[0]) === 0;
  namespace.shims.isRequired = namespace.shims.prefixes.indexOf(requiredPackage) !== -1;

  if (namespace.src.isRequired || namespace.tests.isRequired || namespace.shims.isRequired) {
    const currentDirName = path.dirname(this.id);

    const distDirectoryFullPath = currentDirName.substring(0, currentDirName.indexOf(libDirName));
    const srcDirectoryFullPath = path.join(distDirectoryFullPath, libDirName, namespace.src.dirName);
    const srcDirectoryRelativePath = path.relative(currentDirName, srcDirectoryFullPath);
    const testsDirectoryFullPath = path.join(distDirectoryFullPath, libDirName, namespace.tests.dirName);
    const testsDirectoryRelativePath = path.relative(currentDirName, testsDirectoryFullPath);

    if (namespace.shims.isRequired) {
      arguments[0] = path.join(testsDirectoryRelativePath, arguments[0]);
    } else if (namespace.tests.isRequired) { //order matters here. `shopify-buy/tests` must match before `shopify-buy`
      arguments[0] = arguments[0].replace(namespace.tests.prefixes[0], testsDirectoryRelativePath);
    } else if (namespace.src.isRequired) {
      arguments[0] = arguments[0].replace(namespace.src.prefixes[0], srcDirectoryRelativePath);
    }
  }

  return originalRequire.apply(this, arguments);
};

function addToLog(message) {
  tapMessage = `${tapMessage}${message}\n`;
}

QUnit.log(function (data) {
  if (!tests[data.testId]) {
    tests[data.testId] = [];
  }

  tests[data.testId].push(data);
});

QUnit.testDone(function (data) {
  let status = 'ok';

  if (data.failed !== 0) {
    status = 'not ok';
  }

  addToLog(`${status} ${index} NodeQUnit - ${data.module}: ${data.name}`);
  if (data.failed !== 0) {
    tests[data.testId].forEach(function (log) {
      if (log.result === false) {
        addToLog('actual: >', log.actual);
        addToLog('expected: >', log.expected);
        addToLog('message: >', log.message);
        addToLog('Log: ', '');
      }
    });
  }

  delete tests[data.testId];
  index++;
});

QUnit.done(function () {
  console.info(tapMessage);
});

function recursiveReadDir(dir) {
  let files = [];

  fs.readdirSync(dir).forEach(function (fileName) {
    fileName = path.join(dir, fileName);
    if (fs.statSync(fileName).isDirectory()) {
      files = files.concat(recursiveReadDir(fileName));
    } else {
      files = files.concat(fileName);
    }
  });

  return files;
}
// require(`${rootDirectory}.dist-test/node-lib/tests/integration/shop-client-fetch-collection-test.js`);
recursiveReadDir(`${rootDirectory}.dist-test/node-lib/tests`).map(function(test){
  require(test);
});

QUnit.load();
