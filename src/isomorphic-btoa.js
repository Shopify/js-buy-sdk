/* global Buffer */

import globalVars from './metal/global-vars';
import isNodeLikeEnvironment from './metal/is-node-like-environment';

if (isNodeLikeEnvironment()) {
  globalVars.set('btoa', function (string) {
    return (new Buffer(string)).toString('base64');
  });
}
