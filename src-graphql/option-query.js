export default function optionQuery(fields = ['id', 'name', 'values']) {
  return function(parentSelection, fieldName) {
    parentSelection.add(fieldName, (option) => {
      fields.forEach((field) => {
        option.add(field);
      });
    });
  };
}
