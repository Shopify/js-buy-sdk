import assign from 'buy-button-sdk/metal/assign';


function wrap(func, superFunc) {
  function superWrapper() {
    const originalSuper = this.super;

    this.super = function () {
      return superFunc.apply(this, arguments);
    };

    const ret = func.apply(this, arguments);

    this.super = originalSuper;

    return ret;
  }

  superWrapper.wrappedFunction = func;

  return superWrapper;
}

function defineProperties(destination, props, parentPrototype) {
  let type;
  let value;

  Object.keys(props).forEach(function (key) {
    value = props[key];
    type = typeof value;

    if (type === 'function') {
      const parentFunc = parentPrototype[key];

      if (typeof parentFunc === 'function') {
        const wrappedFunction = wrap(value, parentFunc);

        Object.defineProperty(destination, key, { value: wrappedFunction });
      } else {
        Object.defineProperty(destination, key, { value: value });
      }
    } else if (type === 'object') {
      Object.defineProperty(destination, key, value);
    } else {
      Object.defineProperty(destination, key, Object.getOwnPropertyDescriptor(props, key));
    }
  });
}

function createClass(props, parent = Object) {
  const protoProps = assign({}, props);
  const Constructor = wrap(protoProps.constructor, parent);
  const staticProps = protoProps.static;

  delete protoProps.constructor;
  delete protoProps.static;

  Constructor.prototype = Object.create(parent.prototype);

  if (Object.keys(protoProps).length > 0) {
    defineProperties(Constructor.prototype, protoProps, parent.prototype);
  }

  Constructor.prototype.constructor = Constructor;

  if (typeof staticProps === 'object' && Object.keys(staticProps).length > 0) {
    defineProperties(Constructor, staticProps, parent);
  }

  return Constructor;
}

export default createClass;
