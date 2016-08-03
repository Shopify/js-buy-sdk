/* global exports */

exports.config = {
  specs: [
    './examples/cart/specs/**/*.js'
  ],
  exclude: [
  ],
  maxInstances: 10,
  capabilities: [{
    maxInstances: 5,
    browserName: 'phantomjs'
  }],
  reporters: ['dot', 'junit'],
  reporterOptions: {
    junit: {
      outputDir: './'
    }
  },
  sync: true,
  logLevel: 'error',
  coloredLogs: true,
  screenshotPath: './errorShots/',
  baseUrl: 'http://localhost:4200/examples/cart',
  waitforTimeout: 60000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd'
  }
};
