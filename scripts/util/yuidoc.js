var Y = require('yuidocjs');
var fs = require('fs');
var path = require('path');

/** prepare options in format required by YUIDOC
  * It is based on logic in Y.Project.init
  */
var project = Y.Files.getJSON('./yuidoc.json');
var options = project.options;
  delete project.options;
  options.project = project;
  options.nocode = true;
  options.themedir = path.dirname(require.resolve(path.join('yuidoc-lucid-theme', 'theme.json')));
  options.helpers = [path.join(options.themedir, 'helpers', 'helpers.js')];

function buildDocSync(directory, rest, cb) {
  options.paths = [ path.join(directory, 'src') ];
  options.outdir = path.join(directory, 'api');
  options.project.version = path.basename(directory);

  Y.log(`Generating docs for ${options.project.version}`, 'info', 'yuidoc');

  var json = (new Y.YUIDoc(options)).run();
  var builder = new Y.DocBuilder(options, json);
  builder.compile(function () {
    Y.log("----------------\n\n", 'info', 'yuidoc');
    if (rest.length) {
      buildDocSync(rest.shift(), rest, cb);
    } else {
      cb();
    }
  });
}

module.exports = {
  generate: function (versionPaths, cb) {
    var starttime = (new Date()).getTime();

    buildDocSync(versionPaths.shift(), versionPaths, function () {
      var endtime = (new Date()).getTime();
      Y.log('Completed in ' + ((endtime - starttime) / 1000) + ' seconds', 'info', 'yuidoc');
      if (cb) {
        cb()
      }
    });
  }
}