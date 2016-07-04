/* global require, module, __dirname */

const Plugin = require('broccoli-plugin');
const path = require('path');
const fs = require('fs');

const rollup = require('rollup').rollup;
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

const nodeResolver = nodeResolve({
  jsnext: true,  // Default: false
  main: true,  // Default: true
  skip: [],  // Default: []
  browser: true,  // Default: false
  extensions: ['.js'],
  preferBuiltins: true
});

function bundleLokka() {
  const lokkaEntry = path.join(path.dirname(require.resolve('lokka')), 'lib', 'index.js');

  return rollup({
    entry: lokkaEntry,
    plugins: [
      nodeResolver,
      commonjs()
    ]
  });
}

function bundleLokkaTransport() {
  const transportBasePath = path.join(path.dirname(require.resolve('lokka')), 'lib', 'transport.js');
  const transportBaseJs = fs.readFileSync(transportBasePath).toString();
  const transportHttpEntry = path.join(path.dirname(require.resolve('lokka-transport-http')), 'lib', 'index.js');

  return rollup({
    entry: transportHttpEntry,
    plugins: [
      nodeResolver,
      {
        load(moduleId) {
          if (moduleId.match(/lokka\/transport/)) {
            return transportBaseJs;
          }

          return null;
        }
      }
    ]
  });
}

function LokkaBuilder(options) {
  const defaultedOptions = options || {};

  Plugin.call(this, [/* takes no input nodes */], {
    annotation: defaultedOptions.annotation
  });

  this.options = defaultedOptions;
}

LokkaBuilder.prototype = Object.create(Plugin.prototype);
LokkaBuilder.prototype.constructor = LokkaBuilder;

LokkaBuilder.prototype.build = function () {
  return Promise.all([
    bundleLokka(),
    bundleLokkaTransport()
  ]).then(bundles => {
    const lokka = bundles[0];
    const lokkaTransportHttp = bundles[1];


    lokka.write({
      format: 'es',
      exports: 'named',
      dest: path.join(this.outputPath, 'lokka.js')
    });
    lokkaTransportHttp.write({
      format: 'es',
      exports: 'named',
      dest: path.join(this.outputPath, 'lokka-transport-http.js')
    });
  });
};

module.exports = LokkaBuilder;
