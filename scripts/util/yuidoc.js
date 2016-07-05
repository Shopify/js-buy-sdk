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
  options.quiet = true;
  options.themedir = path.dirname(require.resolve(path.join('yuidoc-lucid-theme', 'theme.json')));
  options.helpers = [path.join(options.themedir, 'helpers', 'helpers.js')];

function buildDocSync(directory, rest, callback) {
  options.paths = [ path.join(directory, 'src') ];
  options.outdir = path.join(directory, 'api');
  options.project.version = path.basename(directory);

  console.log('Generating docs for ' + options.project.version, 'info', 'yuidoc');

  var json = (new Y.YUIDoc(options)).run();
  var builder = new Y.DocBuilder(options, json);
  builder.compile(function () {
    if (rest.length) {
      buildDocSync(rest.shift(), rest, callback);
    } else {
      callback();
    }
  });
}

module.exports = {
  generate: function (_options, callback) {
    var starttime = (new Date()).getTime();
    var versionPaths = _options.paths;
    options.themedir = _options.themeDir || options.themedir;

    buildDocSync(versionPaths.shift(), versionPaths, function () {
      var endtime = (new Date()).getTime();
      Y.log('Completed in ' + ((endtime - starttime) / 1000) + ' seconds', 'info', 'yuidoc');
      if (callback) {
        callback()
      }
    });
  }
}
