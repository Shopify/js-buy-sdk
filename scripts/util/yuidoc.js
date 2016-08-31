"use strict";

const path = require('path');

const yuidoc = require('yuidocjs');
const project = yuidoc.Files.getJSON('./yuidoc.json');
const options = project.options;

options.paths = [];
options.project = project;
delete options.project.options;

module.exports = {
  generate: function (apiDocsMeta) {
    const starttime = (new Date()).getTime();
    const promises = apiDocsMeta.map((meta) => {
      const currentOptions = JSON.parse(JSON.stringify(options));

      currentOptions.project.version = meta.version;
      currentOptions.paths = [ path.join(meta.srcRelativePath, 'src') ];
      currentOptions.outdir = meta.apiPath;

      const json = (new yuidoc.YUIDoc(currentOptions)).run();
      const builder = new yuidoc.DocBuilder(currentOptions, json);

      return new Promise((resolve, reject) => {
        console.info('info: Generating docs for ' + currentOptions.project.version, 'info', 'yuidoc');
        builder.compile(function () {
          resolve();
        });
      });
    });

    return Promise.all(promises).then(() => {
      const endtime = (new Date()).getTime();
      console.info('info: Completed in ' + ((endtime - starttime) / 1000) + ' seconds', 'info', 'yuidoc');
    });
  }
}
