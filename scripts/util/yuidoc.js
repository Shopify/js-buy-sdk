var yuidoc = require('yuidocjs');
var fs = require('fs');
var path = require('path');
var util = require('util');

/** prepare options in format required by YUIDOC
  * It is based on logic in yuidoc.Project.init
  */
var project = yuidoc.Files.getJSON('./yuidoc.json');
var options = project.options;

delete project.options;
options.paths = [];
options.project = project;

module.exports = {
  generate: function (_options) {
    options = Object.assign({}, options, _options);
    var starttime = (new Date()).getTime();
    var promises = options.paths.map((currentPath) => {
      var currentOptions = JSON.parse(JSON.stringify(options));
      Object.assign(currentOptions, {
        paths: [ path.join(currentPath, 'src') ],
        outdir: currentPath,
        project: {
          version: path.basename(currentPath)
        }
      });

      var json = (new yuidoc.YUIDoc(currentOptions)).run();
      var builder = new yuidoc.DocBuilder(currentOptions, json);

      return new Promise((resolve, reject) => {
        console.info('info: Generating docs for ' + currentOptions.project.version, 'info', 'yuidoc');
        builder.compile(function () {
          resolve();
        });
      })
    });

    return Promise.all(promises).then(() => {
      var endtime = (new Date()).getTime();
      console.info('info: Completed in ' + ((endtime - starttime) / 1000) + ' seconds', 'info', 'yuidoc');
    });
  }
}
