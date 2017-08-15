import addFields from './add-fields';

export default function nodeQuery(type, fields) {
  return function(parentSelection, fieldName, id) {
    parentSelection.add(fieldName, {args: {id}}, (node) => {
      node.addInlineFragmentOn(type, (product) => {
        addFields(product, fields);
      });
    });
  };
}
