import selectedOptionQuery from './selected-option-query';
import imageQuery from './image-query';
import addFields from './add-fields';

const defaultFields = ['id', 'title', 'price', 'weight', ['image', imageQuery()], ['selectedOptions', selectedOptionQuery()]];

export default function variantConnectionQuery(fields = defaultFields) {
  return function(parentSelection, fieldName) {
    parentSelection.addConnection(fieldName, {args: {first: 250}}, (variant) => {
      addFields(variant, fields);
    });
  };
}
