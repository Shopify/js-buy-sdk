/* eslint-env node */

import generateSchemaModules from '../graph/generator';

const Plugin = require('broccoli-plugin');
const path = require('path');
const fs = require('fs');
const fsExtra = require('fs-extra');

function GraphSchema(options = { destDir: '' }) {
  Plugin.call(this, [], {
    annotation: options.annotation
  });

  this.options = options;
}

GraphSchema.prototype = Object.create(Plugin.prototype);
GraphSchema.prototype.constructor = GraphSchema;

GraphSchema.prototype.build = function () {
  const rootPath = path.join(this.outputPath, this.options.destDir);

  return generateSchemaModules().then(typeModules => {
    typeModules.forEach(typeModule => {
      const fileName = path.join(rootPath, typeModule.path);
      const dirname = path.dirname(fileName);


      fsExtra.ensureDirSync(dirname);
      fs.writeFileSync(fileName, typeModule.body);
    });
  });
};

module.exports = GraphSchema;
