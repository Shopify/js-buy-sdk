import addFields from './add-fields';
import {defaultFields} from './variant-query';

export default function variantConnectionQuery(fields = defaultFields) {
  return function(parentSelection, fieldName) {
    parentSelection.addConnection(fieldName, {args: {first: 250}}, (variant) => {
      addFields(variant, fields);
    });
  };
}
