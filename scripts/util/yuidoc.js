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
  options.nocode = true;
  options.quiet = true;
  options.themedir = path.dirname(require.resolve(path.join('yuidoc-lucid-theme', 'theme.json')));
  options.helpers = [path.join(options.themedir, 'helpers', 'helpers.js')];

module.exports = {
  generate: function (_options) {
    options = util._extend(options, _options);
    var starttime = (new Date()).getTime();
    var promise = Promise.resolve();

    options.paths.forEach((currentPath) => {
      var currentOptions = JSON.parse(JSON.stringify(options));
      currentOptions = util._extend(currentOptions, {
        paths: [ path.join(currentPath, 'src') ],
        outdir: path.join(currentPath, 'api'),
        project: {
          version: path.basename(currentPath)
        }
      });

      var json = (new yuidoc.YUIDoc(currentOptions)).run();
      var builder = new yuidoc.DocBuilder(currentOptions, json);

      promise = promise.then(() => {
        return new Promise((resolve, reject) => {
          console.info('info: Generating docs for ' + currentOptions.project.version, 'info', 'yuidoc');
          builder.compile(function () {
            resolve();
          });
        })
      });
    });

    return promise.then(() => {
      var endtime = (new Date()).getTime();
      console.info('info: Completed in ' + ((endtime - starttime) / 1000) + ' seconds', 'info', 'yuidoc');
    });
  }
}
