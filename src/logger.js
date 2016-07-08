import CoreObject from './metal/core-object';

function wrapConsole(logCommand) {
  let logMethod;

  /* eslint-disable no-console */
  try {
    logMethod = Function.prototype.bind.call(console[logCommand], console);
  } catch (e) {
    logMethod = Function.prototype.bind.call(console.log, console);
  }
  /* eslint-enable no-console */

  return function () {
    const args = Array.prototype.slice.call(arguments);

    args.unshift('[JS-BUY-SDK]: ');
    logMethod.apply(console, args);
  };
}


const Logger = CoreObject.extend({
  /**
   * Wrapper around the console log so in the future we can have better dev output.
   * Also allows us to disable output in production.
   * @class Logger
   * @constructor
   */
  constructor() { },
  debug: wrapConsole('debug'),
  info: wrapConsole('info'),
  warn: wrapConsole('warn'),
  error: wrapConsole('error')
});

export { wrapConsole };
export default new Logger();
