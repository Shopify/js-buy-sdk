export default function imageQuery(fields = ['id', 'src', 'altText']) {
  return function(parentSelection, fieldName) {
    parentSelection.add(fieldName, (image) => {
      fields.forEach((field) => {
        image.add(field);
      });
    });
  };
}
