import addFields from './add-fields';
import customAttributeQuery from './custom-attribute-query';
import variantQuery from './variant-query';

const defaultFields = ['title', ['variant', variantQuery()], 'quantity', ['customAttributes', customAttributeQuery()]];

export default function lineItemConnectionQuery(fields = defaultFields) {
  return function(parentSelection, fieldName) {
    parentSelection.addConnection(fieldName, {args: {first: 250}}, (lineItems) => {
      addFields(lineItems, fields);
    });
  };
}
