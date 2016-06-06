#!/usr/bin/env node

/* globals global */

'use strict';

global.QUnit = require('qunitjs');
let path = require('path');
let Module = require('module');
let fs = require('fs');
let index = 1;
let tapMessage = '';
const tests = {};
const originalRequire = Module.prototype.require;

Module.prototype.require = function () {
  const shopifyBuySrcNamespace = 'shopify-buy';
  const shopifyBuyTestsNamespace = 'shopify-buy/tests';
  const qunitShimName = 'qunit';
  const requiresShopifyBuySrc = arguments[0].indexOf(shopifyBuySrcNamespace) === 0;
  const requiresShopifyBuyTest = arguments[0].indexOf(shopifyBuyTestsNamespace) === 0;
  const requiresQunitShim = arguments[0] === qunitShimName;

  if (requiresShopifyBuyTest || requiresShopifyBuySrc || requiresQunitShim) {
    const libDirectoryName = 'node-lib';
    const srcDirectoryName = 'src';
    const testsDirectoryName = 'tests';
    const currentDirectoryFullPath = path.dirname(this.id);

    const distDirectoryFullPath = currentDirectoryFullPath.substring(0, currentDirectoryFullPath.indexOf(libDirectoryName));
    const srcDirectoryFullPath = path.join(distDirectoryFullPath, libDirectoryName, srcDirectoryName);
    const srcDirectoryRelativePath = path.relative(currentDirectoryFullPath, srcDirectoryFullPath);
    const testsDirectoryFullPath = path.join(distDirectoryFullPath, libDirectoryName, testsDirectoryName);
    const testsDirectoryRelativePath = path.relative(currentDirectoryFullPath, testsDirectoryFullPath);

    if (requiresQunitShim) {
      arguments[0] = path.join(testsDirectoryRelativePath, arguments[0]);
    } else if (requiresShopifyBuyTest) { //order matters here. `shopify-buy/tests` must match before `shopify-buy`
      arguments[0] = arguments[0].replace(shopifyBuyTestsNamespace, testsDirectoryRelativePath);
    } else if (requiresShopifyBuySrc) {
      arguments[0] = arguments[0].replace(shopifyBuySrcNamespace, srcDirectoryRelativePath);
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

recursiveReadDir(`${__dirname}/../.dist-test/node-lib/tests`).map(function(test){
  // console.log(test)
  require(test);
});

QUnit.load();
