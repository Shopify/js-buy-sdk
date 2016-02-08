import createClass from 'buy-button-sdk/metal/create-class';

const CoreObject = createClass({
  constructor() {
  },

  static: {
    extend(subClassProps) {
      return createClass(subClassProps, this);
    }
  }
});

export default CoreObject;
