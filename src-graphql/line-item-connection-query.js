import addFields from './add-fields';
import attributeQuery from './attribute-query';

const defaultFields = ['title', 'variant', 'quantity', ['customAttributes', attributeQuery()]];

export default function lineItemsConnectionQuery(fields = defaultFields) {
  return function(parentSelection, fieldName) {
    parentSelection.addConnection(fieldName, {args: {first: 250}}, (lineItems) => {
      addFields(lineItems, fields);
    });
  };
}
