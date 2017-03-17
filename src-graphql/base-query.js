import addFields from './add-fields';

export default function baseQuery(fields) {
  return function(parentSelection, fieldName) {
    parentSelection.add(fieldName, (selection) => {
      addFields(selection, fields);
    });
  };
}
