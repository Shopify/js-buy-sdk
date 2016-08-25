import GraphModel from './graph-model';

export default class ClassRegistry {
  constructor() {
    this.classStore = {};
  }

  registerClassForType(constructor, type) {
    this.classStore[type] = constructor;
  }

  unregisterClassForType(type) {
    delete this.classStore[type];
  }

  classForType(type) {
    return this.classStore[type] || GraphModel;
  }
}
