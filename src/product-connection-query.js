import addFields from './add-fields';
import {defaultFields} from './product-node-query';

export default function productConnectionQuery(fields = defaultFields) {
  return function(parentSelection, fieldName, options) {
    parentSelection.addConnection(fieldName, {args: Object.assign({first: 20}, options)}, (products) => {
      addFields(products, fields);
    });
  };
}
