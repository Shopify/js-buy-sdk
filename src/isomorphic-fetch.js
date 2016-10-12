/* globals require */

import globalVars from './metal/global-vars';
import isNodeLikeEnvironment from './metal/is-node-like-environment';

if (isNodeLikeEnvironment()) {
  /* this indirection is needed because babel throws errors when
   * transpiling require('node-fetch') using `amd` plugin with babel6
   */
  const localRequire = require;
  const fetch = localRequire('node-fetch');

  globalVars.set('fetch', fetch);
  globalVars.set('Response', fetch.Response);
}
