/* globals require */

function isNodeLikeEnvironment() {
  const windowAbsent = typeof window === 'undefined';
  const requirePresent = typeof require === 'function';

  return windowAbsent && requirePresent;
}

let RSVP;

if (isNodeLikeEnvironment()) {
  const localRequire = require;

  RSVP = localRequire('rsvp');
} else {
  RSVP = window.RSVP;
}
const Promise = RSVP.Promise;

export { RSVP, Promise };
export default Promise;
