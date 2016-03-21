import BaseModel from './base-model';
import includes from '../metal/includes';


/**
  * Class for product option
  * @class Option
  * @constructor
*/
const ProductOptionModel = BaseModel.extend({
  constructor() {
    this.super(...arguments);

    this.selected = this.values[0];
  },

  /**
    * name of option (ex. "Size", "Color")
    * @property name
    * @type String
  */
  get name() {
    return this.attrs.name;
  },

  /**
    * possible values for selection
    * @property values
    * @type Array
  */
  get values() {
    return this.attrs.values;
  },

  /**
    * get/set selected option value (ex. "Large"). Setting this will update the
    * selected value on the model. Throws {Error} if setting selected to value that does not exist for option
    * @property selected
    * @type String
  */
  get selected() {
    return this._selected;
  },

  set selected(value) {
    if (includes(this.values, value)) {
      this._selected = value;
    } else {
      throw new Error(`Invalid option selection for ${this.name}.`);
    }

    return value;
  }
});

export default ProductOptionModel;
