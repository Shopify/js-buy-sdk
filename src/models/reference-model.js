import BaseModel from './base-model';
import { GUID_KEY } from '../metal/set-guid-for';

const ReferenceModel = BaseModel.extend({

  /**
    * Class for reference model
    * @private
    * @class ReferenceModel
    * @constructor
  */
  constructor(attrs) {
    if (Object.keys(attrs).indexOf('referenceId') < 0) {
      throw new Error('Missing key referenceId of reference. References to null are not allowed');
    }

    this.super(...arguments);
  },

  /**
    * get the ID for current reference (not what it refers to, but its own unique identifier)
    * @property id
    * @type {String}
  */
  get id() {
    return this.attrs[GUID_KEY];
  },

  get referenceId() {
    return this.attrs.referenceId;
  },
  set referenceId(value) {
    this.attrs.referenceId = value;

    return value;
  }

});

export default ReferenceModel;
