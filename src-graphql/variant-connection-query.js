import selectedOptionQuery from './selected-option-query';
import addFields from './add-fields';

const defaultFields = ['id', 'title', 'price', 'weight', ['selectedOptions', selectedOptionQuery()]];

export default function variantConnectionQuery(fields = defaultFields) {
  return function(parentSelection, fieldName) {
    parentSelection.addConnection(fieldName, {args: {first: 20}}, (variant) => {
      addFields(variant, fields);
    });
  };
}
