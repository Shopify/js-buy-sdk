export default function selectedOptionQuery(fields = ['name', 'value']) {
  return function(parentSelection, fieldName) {
    parentSelection.add(fieldName, (selectedOption) => {
      fields.forEach((field) => {
        selectedOption.add(field);
      });
    });
  };
}
