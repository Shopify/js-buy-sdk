import CoreObject from './metal/core-object';

const Logger = CoreObject.extend({
  /**
   * Wrapper around the console log so in the future we can have better dev output.
   * Also allows us to disable output in production.
   * @class Logger
   * @constructor
   */
  constructor() {
  },

  /* eslint-disable no-console */
  log() {
    console.log(...this.tagLog(...arguments));
  },

  debug() {
    console.debug(...this.tagLog(...arguments));
  },

  info() {
    console.info(...this.tagLog(...arguments));
  },

  warn() {
    console.warn(...this.tagLog(...arguments));
  },

  error() {
    console.error(...this.tagLog(...arguments));
  },

  tagLog() {
    const args = Array.prototype.slice.call(arguments);

    args.unshift('[JS-BUY-SDK]: ');

    return args;
  }
  /* eslint-enable no-console */

});

export default new Logger();
