export default function optionQuery(fields = ['id', 'name', 'values']) {
  return function(parentQuery, fieldName) {
    parentQuery.add(fieldName, (option) => {
      fields.forEach((field) => {
        option.add(field);
      });
    });
  };
}
