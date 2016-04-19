/* global Buffer */

import global from './metal/global';
import isNodeLikeEnvironment from './metal/is-node-like-environment';

const btoa = global.btoa;

if (!btoa && isNodeLikeEnvironment()) {
  global.btoa = function (string) {
    return (new Buffer(string)).toString('base64');
  };
}
