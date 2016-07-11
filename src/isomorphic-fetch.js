/* globals require */

import global from './metal/global';
import isNodeLikeEnvironment from './metal/is-node-like-environment';

const fetch = global.fetch;

if (!fetch && isNodeLikeEnvironment()) {
  /* global.require is only available in the REPL 
   * and Babel fails when you use require() explicitly
   */
  const localRequire = require;

  global.fetch = localRequire('node-fetch');
  global.Response = global.fetch.Response;
}
