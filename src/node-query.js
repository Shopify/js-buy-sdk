import addFields from './add-fields';
import createGid from './create-gid';

export default function nodeQuery(type, fields) {
  return function(parentSelection, fieldName, id) {
    parentSelection.add(fieldName, {args: {id: createGid(type, id)}}, (node) => {
      node.addInlineFragmentOn(type, (product) => {
        addFields(product, fields);
      });
    });
  };
}
