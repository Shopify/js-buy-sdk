export default function imageConnectionQuery(fields = ['id', 'src', 'altText']) {
  return function(parentSelection, fieldName) {
    parentSelection.addConnection(fieldName, {args: {first: 250}}, (image) => {
      fields.forEach((field) => {
        image.add(field);
      });
    });
  };
}
