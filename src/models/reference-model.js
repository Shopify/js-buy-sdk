import BaseModel from './base-model';
import { GUID_KEY } from '../metal/set-guid-for';

const ReferenceModel = BaseModel.extend({

  /**
    * Class for cart model
    * @class CartModel
    * @constructor
  */
  constructor(attrs) {
    if (Object.keys(attrs).indexOf('referenceId') < 0) {
      throw new Error('Missing key referenceId of reference. References to null are not allowed');
    }

    this.super(...arguments);
  },

  /**
    * get ID for current cart
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
