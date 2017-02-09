export default function imageConnectionQuery(fields = ['id', 'src', 'altText']) {
  return function(parentSelection, fieldName) {
    parentSelection.addConnection(fieldName, {args: {first: 20}}, (image) => {
      fields.forEach((field) => {
        image.add(field);
      });
    });
  };
}
