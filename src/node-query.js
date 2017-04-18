import addFields from './add-fields';
import normalizeId from './normalize-id';

export default function nodeQuery(type, fields) {
  return function(parentSelection, fieldName, id) {
    parentSelection.add(fieldName, {args: {id: normalizeId(type, id)}}, (node) => {
      node.addInlineFragmentOn(type, (product) => {
        addFields(product, fields);
      });
    });
  };
}
