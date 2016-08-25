export default class GraphModel {
  constructor(attrs) {
    this.attrs = attrs;

    Object.keys(this.attrs).filter(key => {
      return !(key in this);
    }).forEach(key => {
      Object.defineProperty(this, key, {
        get() {
          return this.attrs[key];
        }
      });
    });
  }
}
