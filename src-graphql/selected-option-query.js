export default function selectedOptionQuery(fields = ['name', 'value']) {
  return function(parentQuery, fieldName) {
    parentQuery.add(fieldName, (selectedOption) => {
      fields.forEach((field) => {
        selectedOption.add(field);
      });
    });
  };
}
