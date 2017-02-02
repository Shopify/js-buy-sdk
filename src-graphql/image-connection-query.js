export default function imagesQuery(fields = ['id', 'src', 'altText']) {
  return function(parentQuery, fieldName) {
    parentQuery.addConnection(fieldName, {args: {first: 20}}, (image) => {
      fields.forEach((field) => {
        image.add(field);
      });
    });
  };
}
