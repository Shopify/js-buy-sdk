import BaseModel from './base-model';
import includes from '../metal/includes';


/**
  * Class for product option
  * @class ProductOptionModel
  * @constructor
*/
const ProductOptionModel = BaseModel.extend({
  constructor() {
    this.super(...arguments);

    this.selected = this.values[0];
  },

  /**
    * name of option. Example values: `"Size"`, `"Color"`, etc.
    * @property name
    * @readOnly
    * @type String
  */
  get name() {
    return this.attrs.name;
  },

  /**
    * an Array possible values for option. For instance if this option is a "Size" option an example value 
    * for values could be: `["Large", "Medium", "Small"]`
    * 
    * @property values
    * @readOnly
    * @type Array
  */
  get values() {
    return this.attrs.values;
  },

  /**
    * get/set the currently selected option value with one of the values from the {{#crossLink "ProductOptionModel/values"}}ProductOptionModel.values{{/crossLink}} array. For 
    * instance if the option values array had the following `["Large", "Medium", "Small"]` setting `selected` to be 
    * `"Large"`, `"Medium"`, or `"Small"` would be valid any other value would throw an `Error`.
    * 
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
