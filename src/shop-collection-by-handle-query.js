import addFields from './add-fields';
import {defaultFields} from './collection-node-query';

export default function shopProductByHandleQuery(fields = defaultFields) {
  return function(parentSelection, fieldName, handle) {
    parentSelection.add(fieldName, {args: {handle}}, (node) => {
      node.addInlineFragmentOn('Collection', (collection) => {
        addFields(collection, fields);
      });
    });
  };
}
