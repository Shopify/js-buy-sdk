import assign from 'buy-button-sdk/metal/assign';
import includes from 'buy-button-sdk/metal/includes';

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

function defineProperties(names, proto, destination) {
  const parentProto = Object.getPrototypeOf(destination);
  let descriptor;
  let parentDescriptor;

  names.forEach(function (name) {
    descriptor = Object.getOwnPropertyDescriptor(proto, name);
    parentDescriptor = parentProto.hasOwnProperty(name) && Object.getOwnPropertyDescriptor(parentProto, name);

    if (typeof parentDescriptor.value === 'function' && typeof descriptor.value === 'function') {
      const wrappedFunction = wrap(descriptor.value, parentDescriptor.value);

      Object.defineProperty(destination, name, { value: wrappedFunction });
    } else {
      Object.defineProperty(destination, name, descriptor);
    }
  });
}

function createClass(props, parent = Object) {
  const Constructor = wrap(props.constructor, parent);
  const instancePropertyNames = Object.getOwnPropertyNames(props).filter(key => {
    return !includes(['constructor', 'static'], key);
  });

  assign(Constructor, parent);

  Constructor.prototype = Object.create(parent.prototype);
  defineProperties(instancePropertyNames, props, Constructor.prototype);
  Constructor.prototype.constructor = Constructor;

  const staticProps = props.static;

  if (staticProps) {
    const staticPropertyNames = Object.getOwnPropertyNames(staticProps);

    defineProperties(staticPropertyNames, staticProps, Constructor);
  }

  return Constructor;
}

export default createClass;
