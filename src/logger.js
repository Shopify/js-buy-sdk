import CoreObject from './metal/core-object';

function wrapConsole(logCommand) {
  const logMethod = function () {
    let log;

    /* eslint-disable no-console */
    if (console[logCommand]) {
      log = Function.prototype.bind.call(console[logCommand], console);
    } else {
      log = Function.prototype.bind.call(console.log, console);
    }
    log(...arguments);
    /* eslint-enable no-console */
  };

  return function () {
    const args = [...arguments];

    args.unshift('[JS-BUY-SDK]: ');
    logMethod(...args);
  };
}


const Logger = CoreObject.extend({
  /**
   * Wrapper around the console log so in the future we can have better dev output.
   * Also allows us to disable output in production.
   */
  constructor() { },
  debug: wrapConsole('debug'),
  info: wrapConsole('info'),
  warn: wrapConsole('warn'),
  error: wrapConsole('error')
});

export { wrapConsole };
export default new Logger();
