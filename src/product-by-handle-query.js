import addFields from './add-fields';
import {defaultFields} from './product-node-query';

export default function productByHandleQuery(fields = defaultFields) {
  return function(parentSelection, fieldName, handle) {
    parentSelection.add(fieldName, {args: {handle}}, (node) => {
      node.addInlineFragmentOn('Product', (product) => {
        addFields(product, fields);
      });
    });
  };
}
