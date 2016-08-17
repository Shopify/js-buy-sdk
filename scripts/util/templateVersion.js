/**
 * The purpose of this script is to template in a version number into source.
 * The template string will look like this '{{versionString}}'.
 *
 * The template string will be replaced by a version number which is the last
 * git tag and commit.
 */

const getVersion = require('./getVersion');
const VERSION_TEMPLATE_STRING = require('./versionTemplateString');

module.exports = (source, callback) => {
  getVersion((err, version) => {
    if(err) {
      throw err;
    }

    callback(null, source.split(VERSION_TEMPLATE_STRING).join(version));
  });
};
