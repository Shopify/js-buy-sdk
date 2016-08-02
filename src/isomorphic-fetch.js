/* globals require */

import global from './metal/global';
import isNodeLikeEnvironment from './metal/is-node-like-environment';

const fetch = global.fetch;

if (!fetch && isNodeLikeEnvironment()) {
  /* this indirection is needed because babel throws errors when
   * transpiling require('node-fetch') using `amd` plugin with babel6
   */
  const localRequire = require;

  global.fetch = localRequire('node-fetch');
  global.Response = global.fetch.Response;
}
